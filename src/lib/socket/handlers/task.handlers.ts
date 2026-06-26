import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";


export function registerTaskHandlers(socketManager: SocketManager) {
    socketManager.on(SOCKET_EVENTS.TASK.CREATED, payload => {
        // boardCache.addTask(payload);
        console.log("TASK Event With Payload : ", payload);
    });
    socketManager.on(SOCKET_EVENTS.TASK.UPDATED, payload => {
        // boardCache.updateTask(payload);
        console.log("TASK Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.TASK.MOVED, payload => {
        // boardCache.moveTask(payload);
        console.log("TASK Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.TASK.DELETED, payload => {
        // boardCache.removeTask(payload);
        console.log("TASK Event With Payload : ", payload);
    });
}