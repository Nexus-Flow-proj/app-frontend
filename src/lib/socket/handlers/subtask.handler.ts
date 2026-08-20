import { addSubtaskToCache, removeSubtaskFromCache, updateSubtaskInCache } from "@/features/boards/cache/task-detail.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import { mapSubtask } from "@/features/boards/mappers";
import type { QueryClient } from "@tanstack/react-query";
import { HighlightEntity, useHighlightStore } from "@/store/highlight.store";

const REALTIME_EXIT_MS = 220;

export function registerSubtaskHandlers(socketManager: SocketManager, qc: QueryClient): void {
    socketManager.on(SOCKET_EVENTS.SUBTASK.CREATED, payload => {
        const createdSubtask = mapSubtask(payload.subtask, payload.taskId);
        useHighlightStore
            .getState()
            .highlight(HighlightEntity.subtask, createdSubtask.id, 900);
        addSubtaskToCache(qc, payload.taskId, createdSubtask);
        console.log("Subtask Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.SUBTASK.UPDATED, payload => {
        const updatedSubtask = mapSubtask(payload.subtask, payload.taskId);
        updateSubtaskInCache(qc, payload.taskId, updatedSubtask);
        console.log("Subtask Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.SUBTASK.DELETED, (payload) => {
        useHighlightStore
            .getState()
            .markRemoving(HighlightEntity.subtask, payload.subtaskId, REALTIME_EXIT_MS + 80);
        setTimeout(() => {
            removeSubtaskFromCache(qc, payload.taskId, payload.subtaskId);
        }, REALTIME_EXIT_MS);
        console.log("Subtask Event With Payload : ", payload.subtaskId);

    });
}
