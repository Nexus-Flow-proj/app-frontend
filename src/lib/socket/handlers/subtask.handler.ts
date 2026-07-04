import { addSubtaskToCache, removeSubtaskFromCache, updateSubtaskInCache } from "@/features/boards/cache/task-detail.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import { mapSubtask } from "@/features/boards/mappers";
import type { QueryClient } from "@tanstack/react-query";

export function registerSubtaskHandlers(socketManager: SocketManager, qc: QueryClient): void {
    socketManager.on(SOCKET_EVENTS.SUBTASK.CREATED, payload => {
        const createdSubtask = mapSubtask(payload.subtask, payload.taskId);
        addSubtaskToCache(qc, payload.taskId, createdSubtask);
        console.log("Subtask Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.SUBTASK.UPDATED, payload => {
        const updatedSubtask = mapSubtask(payload.subtask, payload.taskId);
        updateSubtaskInCache(qc, payload.taskId, updatedSubtask);
        console.log("Subtask Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.SUBTASK.DELETED, async (payload) => {
        await removeSubtaskFromCache(qc, payload.taskId, payload.subtaskId);
        console.log("Subtask Event With Payload : ", payload.subtaskId);

    });
}