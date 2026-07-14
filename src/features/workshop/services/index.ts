import { boardService, taskService } from "@/features/boards/services";
import {
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@/features/boards/types/enums";
import { CanvasObjectType } from "@/types/enums";
import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  Canvas,
  CanvasConnection,
  CanvasObject,
  CanvasViewport,
  SectionFrameData,
  TaskCardData,
  WorkshopSnapshot,
} from "../types";
import { WORKSHOP_MOCK_MODE } from "../constants";
import { mockWorkshopService } from "./mockWorkshopService";
import { validateAndOrderWorkshopPlan } from "../utils/workshopPlan";

export interface SaveCanvasPayload {
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
}

interface PublishWorkshopPlanPayload extends SaveCanvasPayload {
  publishedSnapshot: WorkshopSnapshot;
}

export interface PublishWorkshopPlanResult {
  objects: CanvasObject[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
}

function featureData(object: CanvasObject): SectionFrameData {
  return object.data as SectionFrameData;
}

function taskData(object: CanvasObject): TaskCardData {
  return object.data as TaskCardData;
}

async function publishPlanToBoard(
  projectId: string,
  payload: PublishWorkshopPlanPayload,
): Promise<PublishWorkshopPlanResult> {
  const { orderedFeatures, tasks } = validateAndOrderWorkshopPlan(
    payload.objects,
    payload.connections,
  );

  if (WORKSHOP_MOCK_MODE) {
    const featureColumnIds = new Map(
      orderedFeatures.map((feature) => {
        const data = featureData(feature);
        return [
          feature.id,
          data.boardColumnId ?? `mock-column-${feature.id}`,
        ];
      }),
    );
    const objects = payload.objects.map((object) => {
      if (object.type === CanvasObjectType.SECTION_FRAME) {
        const data = featureData(object);
        return {
          ...object,
          data: {
            ...data,
            boardColumnId: featureColumnIds.get(object.id),
          },
        };
      }
      if (object.type === CanvasObjectType.TASK_CARD) {
        const data = taskData(object);
        return {
          ...object,
          data: {
            ...data,
            taskId: data.taskId ?? `mock-task-${object.id}`,
          },
        };
      }
      return object;
    });
    const savedCanvas = await mockWorkshopService.saveCanvas(projectId, {
      objects,
      connections: payload.connections,
      viewport: payload.viewport,
    });

    return {
      objects: savedCanvas.data.objects,
      connections: savedCanvas.data.connections,
      viewport: savedCanvas.data.viewport,
    };
  }

  const [columnsResponse, tasksResponse] = await Promise.all([
    boardService.getBoardColumns(projectId),
    taskService.getProjectTasks(projectId),
  ]);
  const remoteColumns = columnsResponse.data;
  const remoteTasks = tasksResponse.data.tasks;
  const remoteColumnById = new Map(
    remoteColumns.map((column) => [column.id, column]),
  );
  const remoteTaskIds = new Set(remoteTasks.map((task) => task.id));
  const currentObjectIds = new Set(payload.objects.map((object) => object.id));
  const currentFeatureIds = new Set(
    orderedFeatures.map((feature) => feature.id),
  );
  const removedFeatures = payload.publishedSnapshot.objects.filter(
    (object) =>
      object.type === CanvasObjectType.SECTION_FRAME &&
      !currentFeatureIds.has(object.id),
  );

  for (const feature of removedFeatures) {
    const columnId = featureData(feature).boardColumnId;
    if (!columnId) continue;
    const remoteColumn = remoteColumnById.get(columnId);
    if (remoteColumn?.isProtected) {
      throw new Error(`“${remoteColumn.name}” is a protected board column.`);
    }
  }

  const removedTasks = payload.publishedSnapshot.objects.filter(
    (object) =>
      object.type === CanvasObjectType.TASK_CARD &&
      !currentObjectIds.has(object.id) &&
      taskData(object).taskId &&
      remoteTaskIds.has(taskData(object).taskId ?? ""),
  );
  await Promise.all(
    removedTasks.map((object) =>
      taskService.deleteTask(taskData(object).taskId ?? ""),
    ),
  );

  const featureColumnIds = new Map<string, string>();
  const updatedFeatureObjects: CanvasObject[] = [];

  for (const [index, feature] of orderedFeatures.entries()) {
    const data = featureData(feature);
    const remoteColumn = data.boardColumnId
      ? remoteColumnById.get(data.boardColumnId)
      : undefined;
    const response = remoteColumn
      ? await boardService.updateColumn(remoteColumn.id, {
          name: data.title,
          color: data.borderColor,
          sortOrder: index + 1,
        })
      : await boardService.createColumn(projectId, {
          name: data.title,
          color: data.borderColor,
        });
    const columnId = response.data.id;
    featureColumnIds.set(feature.id, columnId);
    updatedFeatureObjects.push({
      ...feature,
      data: { ...data, boardColumnId: columnId },
    });
  }

  const updatedTaskObjects: CanvasObject[] = [];
  const taskOrderByFeature = new Map<string, number>();
  for (const task of tasks) {
    const data = taskData(task);
    const columnId = data.featureId
      ? featureColumnIds.get(data.featureId)
      : undefined;
    if (!columnId) {
      throw new Error(`Task “${data.title}” is not assigned to a feature.`);
    }
    const columnOrder = (taskOrderByFeature.get(columnId) ?? 0) + 1;
    taskOrderByFeature.set(columnId, columnOrder);

    const response =
      data.taskId && remoteTaskIds.has(data.taskId)
        ? await taskService.updateTask(data.taskId, {
            title: data.title,
            description: data.description ?? "",
            deadline: data.dueDate ?? null,
            boardColumnId: columnId,
            columnOrder,
          })
        : await taskService.createTask(projectId, columnId, {
            title: data.title,
            description: data.description,
            deadline: data.dueDate,
            type: TaskType.FEATURE,
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
          });

    updatedTaskObjects.push({
      ...task,
      data: { ...data, taskId: response.data.id },
    });
  }

  for (const feature of removedFeatures) {
    const columnId = featureData(feature).boardColumnId;
    if (!columnId) continue;
    const remoteColumn = remoteColumnById.get(columnId);
    if (!remoteColumn) continue;
    await boardService.deleteColumn(columnId);
  }

  const orderedColumnIds = orderedFeatures
    .map((feature) => featureColumnIds.get(feature.id))
    .filter((id): id is string => Boolean(id));
  const removedColumnIds = new Set(
    removedFeatures
      .map((feature) => featureData(feature).boardColumnId)
      .filter((id): id is string => Boolean(id)),
  );
  const untouchedColumnIds = remoteColumns
    .map((column) => column.id)
    .filter(
      (id) => !orderedColumnIds.includes(id) && !removedColumnIds.has(id),
    );
  const finalColumnOrder = [...orderedColumnIds, ...untouchedColumnIds];

  if (finalColumnOrder.length > 0) {
    await boardService.reorderColumns(projectId, {
      columns: finalColumnOrder.map((id, index) => ({
        id,
        sortOrder: index + 1,
      })),
    });
  }

  const updatedById = new Map(
    [...updatedFeatureObjects, ...updatedTaskObjects].map((object) => [
      object.id,
      object,
    ]),
  );
  const objects = payload.objects.map(
    (object) => updatedById.get(object.id) ?? object,
  );

  const savedCanvas = await workshopService.saveCanvas(projectId, {
    objects,
    connections: payload.connections,
    viewport: payload.viewport,
  });

  return {
    objects: savedCanvas.data.objects,
    connections: savedCanvas.data.connections,
    viewport: savedCanvas.data.viewport,
  };
}

export const workshopService = {
  getCanvas: (projectId: string) =>
    WORKSHOP_MOCK_MODE
      ? mockWorkshopService.getCanvas(projectId)
      : api
          .get<ApiResponse<Canvas>>(`/projects/${projectId}/canvas`)
          .then((response) => response.data),

  saveCanvas: (projectId: string, payload: SaveCanvasPayload) =>
    WORKSHOP_MOCK_MODE
      ? mockWorkshopService.saveCanvas(projectId, payload)
      : api
          .patch<ApiResponse<Canvas>>(
            `/projects/${projectId}/canvas`,
            payload,
          )
          .then((response) => response.data),

  publishPlanToBoard,
};
