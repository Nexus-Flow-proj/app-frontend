import { addTaskToListCache, removeTaskFromListCache, updateTaskInListCache } from "@/features/boards/cache/task-list.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import { mapTaskSummary } from "@/features/boards/mappers";
import { removeTaskDetailCache, updateTaskDetailCache } from "@/features/boards/cache/task-detail.cache";
import type { QueryClient } from "@tanstack/react-query";
import { updateTaskDetail, updateTaskList } from "@/features/boards/hooks/useUpdateTask";
import { HighlightEntity, useHighlightStore } from "@/store/highlight.store";
import { useKanbanStore } from "@/store/kanbanStore";
import type { TaskUpdatedPayload } from "../types/payloads";

const REALTIME_EXIT_MS = 220;
const REALTIME_MOVE_MS = 760;
const POSITION_EPSILON = 0.0001;

type TaskUpdatePayload = TaskUpdatedPayload["task"];
type LocalTaskMove = NonNullable<
    ReturnType<ReturnType<typeof useKanbanStore.getState>["getLocalTaskMove"]>
>;

function isTaskMovementUpdate(task: {
    boardColumnId?: string;
    boardColumn?: { id?: string };
    columnOrder?: number;
    status?: string;
}) {
    return task.boardColumnId !== undefined ||
        task.boardColumn?.id !== undefined ||
        task.columnOrder !== undefined ||
        task.status !== undefined;
}

function getUpdatedTaskColumnId(task: TaskUpdatePayload) {
    return task.boardColumn?.id;
}

function isSameColumnOrder(left?: number, right?: number) {
    if (left === undefined || right === undefined) return left === right;
    return Math.abs(left - right) <= POSITION_EPSILON;
}

function isPendingMoveConfirmation(
    task: TaskUpdatePayload,
    pendingMove: LocalTaskMove,
) {
    const updatedColumnId = getUpdatedTaskColumnId(task);

    return updatedColumnId === pendingMove.boardColumnId &&
        isSameColumnOrder(task.columnOrder, pendingMove.columnOrder) &&
        (task.status === undefined || task.status === pendingMove.status);
}

function stripMovementFields(task: TaskUpdatePayload): TaskUpdatePayload {
    const nonMovementTaskPatch = { ...task };
    delete nonMovementTaskPatch.boardColumn;
    delete nonMovementTaskPatch.columnOrder;
    delete nonMovementTaskPatch.status;

    return nonMovementTaskPatch;
}

export function registerTaskHandlers(socketManager: SocketManager, qc: QueryClient) {
    socketManager.on(SOCKET_EVENTS.TASK.CREATED, payload => {
        const createdTask = mapTaskSummary(payload.task);
        useHighlightStore
            .getState()
            .highlight(
                HighlightEntity.task,
                payload.task.id,
            );
        addTaskToListCache(qc, payload.projectId, createdTask);
        console.log("TASK Event With Payload : ", payload);
    });
    socketManager.on(SOCKET_EVENTS.TASK.UPDATED, async payload => {
        const taskId = payload.task.id;
        if (!taskId) return;
        const isMovementUpdate = isTaskMovementUpdate(payload.task);
        const pendingMove = isMovementUpdate
            ? useKanbanStore.getState().getLocalTaskMove(taskId)
            : null;
        const isLocalMoveConfirmation = pendingMove
            ? isPendingMoveConfirmation(payload.task, pendingMove)
            : false;
        const taskPatch = pendingMove && !isLocalMoveConfirmation
            ? stripMovementFields(payload.task)
            : payload.task;
        const shouldAnimateMovement = isMovementUpdate && !pendingMove;

        if (shouldAnimateMovement) {
            const highlightStore = useHighlightStore.getState();
            highlightStore.captureVisibleLayouts(HighlightEntity.task);
            highlightStore.markMoving(HighlightEntity.task, taskId, REALTIME_MOVE_MS);
        }
        await updateTaskInListCache(qc, payload.projectId, taskId, (task) => updateTaskList(task, taskPatch));
        updateTaskDetailCache(qc, taskId, (task) => updateTaskDetail(task, taskPatch));

        if (isLocalMoveConfirmation) {
            useKanbanStore.getState().clearLocalTaskMove(taskId);
        }

        if (shouldAnimateMovement) {
            useHighlightStore
                .getState()
                .animateCapturedLayouts(HighlightEntity.task, {
                    duration: REALTIME_MOVE_MS,
                    maxFrames: 10,
                });
        }
        console.log("TASK Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.TASK.DELETED, payload => {
        useHighlightStore
            .getState()
            .markRemoving(HighlightEntity.task, payload.taskId, REALTIME_EXIT_MS + 80);
        setTimeout(() => {
            removeTaskDetailCache(qc, payload.taskId);
            removeTaskFromListCache(qc, payload.projectId, payload.taskId);
        }, REALTIME_EXIT_MS);
        console.log("TASK Event With Payload : ", payload);
    });

    // socketManager.on(SOCKET_EVENTS.TASK.MOVED, payload => {
    //     // boardCache.moveTask(payload);
    //     console.log("TASK Event With Payload : ", payload);
    // });
}
