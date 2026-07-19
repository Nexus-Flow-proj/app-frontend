import { addTaskToListCache, removeTaskFromListCache, updateTaskInListCache } from "@/features/boards/cache/task-list.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import { mapTaskSummary } from "@/features/boards/mappers";
import { removeTaskDetailCache, updateTaskDetailCache } from "@/features/boards/cache/task-detail.cache";
import type { QueryClient } from "@tanstack/react-query";
import { updateTaskDetail, updateTaskList } from "@/features/boards/hooks/useUpdateTask";
import { HighlightEntity, useHighlightStore } from "@/store/highlight.store";

const REALTIME_EXIT_MS = 220;
const REALTIME_MOVE_MS = 760;

function isTaskMovementUpdate(task: {
    boardColumnId?: string;
    boardColumn?: { id?: string };
    columnOrder?: number;
}) {
    return task.boardColumnId !== undefined ||
        task.boardColumn?.id !== undefined ||
        task.columnOrder !== undefined;
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

        if (isTaskMovementUpdate(payload.task)) {
            const highlightStore = useHighlightStore.getState();
            highlightStore.captureVisibleLayouts(HighlightEntity.task);
            highlightStore.markMoving(HighlightEntity.task, taskId, REALTIME_MOVE_MS);
        }
        await updateTaskInListCache(qc, payload.projectId, taskId, (task) => updateTaskList(task, payload.task));
        updateTaskDetailCache(qc, taskId, (task) => updateTaskDetail(task, payload.task));
        if (isTaskMovementUpdate(payload.task)) {
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
