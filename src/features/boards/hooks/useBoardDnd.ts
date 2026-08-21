import { useCallback, useMemo, useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import type { BoardColumn, BoardState, Task } from "../types";
import { getTaskStatusFromColumnName } from "../utils/task-status";

type BoardStateUpdater = BoardState | ((current: BoardState) => BoardState);

type DragEntity =
  | { type: "Column"; column: BoardColumn }
  | { type: "Task"; task: Task };

interface UseBoardDndParams {
  boardState: BoardState;
  setBoardState: (updater: BoardStateUpdater) => void;
  onMoveTask?: (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newPositionFloat: number,
  ) => void;
  onMoveColumn?: (columnId: string, newPositionFloat: number) => void;
}

function getOrderBetween(previous?: number, next?: number) {
  if (previous === undefined && next === undefined) return 1;
  if (previous === undefined) return next! > 1 ? next! - 1 : next! / 2;
  if (next === undefined) return previous + 1;
  return (previous + next) / 2;
}

function findTaskColumnId(boardState: BoardState, taskId: string) {
  return Object.entries(boardState.tasks).find(([, tasks]) =>
    tasks.some((task) => task.id === taskId),
  )?.[0];
}

function getTaskFromBoard(boardState: BoardState, taskId: string) {
  const columnId = findTaskColumnId(boardState, taskId);
  if (!columnId) return null;

  const task = boardState.tasks[columnId].find((item) => item.id === taskId);
  return task ? { task, columnId } : null;
}

export function useBoardDnd({
  boardState,
  setBoardState,
  onMoveTask,
  onMoveColumn,
}: UseBoardDndParams) {
  const [activeEntity, setActiveEntity] = useState<DragEntity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeTask = activeEntity?.type === "Task" ? activeEntity.task : null;
  const activeColumn =
    activeEntity?.type === "Column" ? activeEntity.column : null;

  const columnIds = useMemo(
    () => boardState.columnOrder,
    [boardState.columnOrder],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragEntity | undefined;
    setActiveEntity(data ?? null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveEntity(null);

      if (!over || active.id === over.id) return;

      const activeData = active.data.current as DragEntity | undefined;
      const overData = over.data.current as DragEntity | undefined;
      if (!activeData || !overData) return;

      if (activeData.type === "Column" && overData.type === "Column") {
        const oldIndex = boardState.columnOrder.indexOf(activeData.column.id);
        const newIndex = boardState.columnOrder.indexOf(overData.column.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const nextColumnOrder = arrayMove(
          boardState.columnOrder,
          oldIndex,
          newIndex,
        );
        const previousColumn =
          boardState.columns[nextColumnOrder[newIndex - 1]];
        const nextColumn = boardState.columns[nextColumnOrder[newIndex + 1]];
        const newSortOrder = getOrderBetween(
          previousColumn?.sortOrder,
          nextColumn?.sortOrder,
        );

        setBoardState((current) => ({
          ...current,
          columnOrder: nextColumnOrder,
          columns: {
            ...current.columns,
            [activeData.column.id]: {
              ...current.columns[activeData.column.id],
              sortOrder: newSortOrder,
            },
          },
        }));
        onMoveColumn?.(activeData.column.id, newSortOrder);
        return;
      }

      if (activeData.type !== "Task") return;

      const sourceColumnId = findTaskColumnId(boardState, activeData.task.id);
      const targetColumnId =
        overData.type === "Column"
          ? overData.column.id
          : findTaskColumnId(boardState, overData.task.id);

      if (!sourceColumnId || !targetColumnId) return;

      const sourceTasks = boardState.tasks[sourceColumnId] ?? [];
      const targetTasks = boardState.tasks[targetColumnId] ?? [];
      const activeTaskIndex = sourceTasks.findIndex(
        (task) => task.id === activeData.task.id,
      );
      if (activeTaskIndex === -1) return;

      let nextTargetTasks: Task[];
      let newIndex: number;

      if (sourceColumnId === targetColumnId) {
        const overTaskIndex = targetTasks.findIndex(
          (task) => task.id === String(over.id),
        );
        if (overTaskIndex === -1) return;
        nextTargetTasks = arrayMove(targetTasks, activeTaskIndex, overTaskIndex);
        newIndex = overTaskIndex;
      } else {
        const overTaskIndex =
          overData.type === "Task"
            ? targetTasks.findIndex((task) => task.id === overData.task.id)
            : targetTasks.length;
        newIndex = overTaskIndex === -1 ? targetTasks.length : overTaskIndex;
        const movingTask = sourceTasks[activeTaskIndex];
        nextTargetTasks = [
          ...targetTasks.slice(0, newIndex),
          movingTask,
          ...targetTasks.slice(newIndex),
        ];
      }

      const previousTask = nextTargetTasks[newIndex - 1];
      const nextTask = nextTargetTasks[newIndex + 1];
      const newColumnOrder = getOrderBetween(
        previousTask?.columnOrder,
        nextTask?.columnOrder,
      );
      const movedTask: Task = {
        ...activeData.task,
        boardColumnId: targetColumnId,
        columnOrder: newColumnOrder,
        status: getTaskStatusFromColumnName(
          boardState.columns[targetColumnId]?.name,
          activeData.task.status,
        ),
      };

      setBoardState((current) => {
        const currentSourceTasks = current.tasks[sourceColumnId] ?? [];
        const currentTargetTasks = current.tasks[targetColumnId] ?? [];
        const withoutMovedTask = currentSourceTasks.filter(
          (task) => task.id !== activeData.task.id,
        );

        if (sourceColumnId === targetColumnId) {
          return {
            ...current,
            tasks: {
              ...current.tasks,
              [sourceColumnId]: nextTargetTasks.map((task) =>
                task.id === movedTask.id ? movedTask : task,
              ),
            },
          };
        }

        return {
          ...current,
          tasks: {
            ...current.tasks,
            [sourceColumnId]: withoutMovedTask,
            [targetColumnId]: [
              ...currentTargetTasks.slice(0, newIndex),
              movedTask,
              ...currentTargetTasks.slice(newIndex),
            ],
          },
        };
      });

      onMoveTask?.(
        activeData.task.id,
        sourceColumnId,
        targetColumnId,
        newColumnOrder,
      );
    },
    [boardState, onMoveColumn, onMoveTask, setBoardState],
  );

  return {
    sensors,
    columnIds,
    activeTask,
    activeColumn,
    handleDragStart,
    handleDragEnd,
    getTaskFromBoard: (taskId: string) => getTaskFromBoard(boardState, taskId),
  };
}
