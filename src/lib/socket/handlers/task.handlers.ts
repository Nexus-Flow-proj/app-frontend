import { addTaskToListCache, removeTaskFromListCache, updateTaskInListCache } from "@/features/boards/cache/task-list.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import { mapTaskSummary } from "@/features/boards/mappers";
import { removeTaskDetailCache, updateTaskDetailCache } from "@/features/boards/cache/task-detail.cache";
import type { QueryClient } from "@tanstack/react-query";
import { updateTaskDetail, updateTaskList } from "@/features/boards/hooks/useUpdateTask";


export function registerTaskHandlers(socketManager: SocketManager, qc: QueryClient) {
    socketManager.on(SOCKET_EVENTS.TASK.CREATED, payload => {
        const createdTask = mapTaskSummary(payload.task);
        addTaskToListCache(qc, payload.projectId, createdTask);
        console.log("TASK Event With Payload : ", payload);
    });
    socketManager.on(SOCKET_EVENTS.TASK.UPDATED, payload => {
        const taskId = payload.task.id;
        if (!taskId) return;

        updateTaskInListCache(qc, payload.projectId, taskId, (task) => updateTaskList(task, payload.task));
        updateTaskDetailCache(qc, taskId, (task) => updateTaskDetail(task, payload.task));
        console.log("TASK Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.TASK.DELETED, payload => {
        removeTaskDetailCache(qc, payload.taskId);
        removeTaskFromListCache(qc, payload.projectId, payload.taskId);
        console.log("TASK Event With Payload : ", payload);
    });

    // socketManager.on(SOCKET_EVENTS.TASK.MOVED, payload => {
    //     // boardCache.moveTask(payload);
    //     console.log("TASK Event With Payload : ", payload);
    // });
}
