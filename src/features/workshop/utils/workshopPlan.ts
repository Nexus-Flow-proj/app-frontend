import { CanvasObjectType } from "@/types/enums";
import type {
  CanvasConnection,
  CanvasObject,
  SectionFrameData,
  TaskCardData,
  WorkshopSnapshot,
} from "../types";
import { isTaskInsideFeature } from "./featureContainment";

export type DraftChange = "ADDED" | "MODIFIED" | "UNCHANGED";

export interface WorkshopPlanValidation {
  orderedFeatures: CanvasObject[];
  tasks: CanvasObject[];
}

export interface DraftSummary {
  added: number;
  modified: number;
  deleted: number;
  orderChanged: boolean;
}

export function isFeatureObject(object: CanvasObject): boolean {
  return object.type === CanvasObjectType.SECTION_FRAME;
}

export function isTaskObject(object: CanvasObject): boolean {
  return object.type === CanvasObjectType.TASK_CARD;
}

export function getTaskFeatureId(object: CanvasObject): string | undefined {
  return isTaskObject(object)
    ? (object.data as TaskCardData).featureId
    : undefined;
}

export function getDraftChange(
  object: CanvasObject,
  publishedSnapshot: WorkshopSnapshot,
): DraftChange {
  const published = publishedSnapshot.objects.find(
    (candidate) => candidate.id === object.id,
  );

  if (!published) return "ADDED";
  return JSON.stringify(published) === JSON.stringify(object)
    ? "UNCHANGED"
    : "MODIFIED";
}

export function getDraftSummary(
  objects: CanvasObject[],
  connections: CanvasConnection[],
  publishedSnapshot: WorkshopSnapshot,
): DraftSummary {
  const changes = objects.map((object) =>
    getDraftChange(object, publishedSnapshot),
  );
  const currentIds = new Set(objects.map((object) => object.id));

  return {
    added: changes.filter((change) => change === "ADDED").length,
    modified: changes.filter((change) => change === "MODIFIED").length,
    deleted: publishedSnapshot.objects.filter(
      (object) => !currentIds.has(object.id),
    ).length,
    orderChanged:
      JSON.stringify(connections) !==
      JSON.stringify(publishedSnapshot.connections),
  };
}

export function validateAndOrderWorkshopPlan(
  objects: CanvasObject[],
  connections: CanvasConnection[],
): WorkshopPlanValidation {
  const features = objects.filter(isFeatureObject);
  const tasks = objects.filter(isTaskObject);

  if (features.length === 0) {
    throw new Error("Add at least one feature before saving the plan.");
  }

  const featureIds = new Set(features.map((feature) => feature.id));
  const containingFeatureById = new Map(
    features.map((feature) => [feature.id, feature]),
  );
  const invalidTask = tasks.find((task) => {
    const featureId = (task.data as TaskCardData).featureId;
    const feature = featureId
      ? containingFeatureById.get(featureId)
      : undefined;
    return !feature || !isTaskInsideFeature(task, feature);
  });

  if (invalidTask) {
    const title = (invalidTask.data as TaskCardData).title;
    throw new Error(`Assign “${title}” to a feature before saving.`);
  }

  const invalidConnection = connections.find(
    (connection) =>
      !featureIds.has(connection.fromObjectId) ||
      !featureIds.has(connection.toObjectId),
  );

  if (invalidConnection) {
    throw new Error("Connections can only link one feature to another.");
  }

  return {
    orderedFeatures: topologicalFeatureOrder(features, connections),
    tasks,
  };
}

function topologicalFeatureOrder(
  features: CanvasObject[],
  connections: CanvasConnection[],
): CanvasObject[] {
  const visualOrder = [...features].sort(
    (a, b) => a.x - b.x || a.y - b.y || a.id.localeCompare(b.id),
  );
  const visualIndex = new Map(
    visualOrder.map((feature, index) => [feature.id, index]),
  );
  const featureById = new Map(features.map((feature) => [feature.id, feature]));
  const inDegree = new Map(features.map((feature) => [feature.id, 0]));
  const outgoing = new Map(features.map((feature) => [feature.id, [] as string[]]));

  connections.forEach((connection) => {
    outgoing.get(connection.fromObjectId)?.push(connection.toObjectId);
    inDegree.set(
      connection.toObjectId,
      (inDegree.get(connection.toObjectId) ?? 0) + 1,
    );
  });

  const ready = visualOrder.filter((feature) => inDegree.get(feature.id) === 0);
  const result: CanvasObject[] = [];

  while (ready.length > 0) {
    ready.sort(
      (a, b) =>
        (visualIndex.get(a.id) ?? 0) - (visualIndex.get(b.id) ?? 0),
    );
    const feature = ready.shift();
    if (!feature) break;
    result.push(feature);

    outgoing.get(feature.id)?.forEach((targetId) => {
      const nextDegree = (inDegree.get(targetId) ?? 0) - 1;
      inDegree.set(targetId, nextDegree);
      if (nextDegree === 0) {
        const target = featureById.get(targetId);
        if (target) ready.push(target);
      }
    });
  }

  if (result.length !== features.length) {
    throw new Error(
      "Feature connections contain a cycle. Remove the loop before saving.",
    );
  }

  return result;
}

export function getFeatureTitle(feature: CanvasObject): string {
  return (feature.data as SectionFrameData).title;
}
