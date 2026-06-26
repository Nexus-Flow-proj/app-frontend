import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";

export function registerColumnHandlers(socketManager: SocketManager): void {
    socketManager.on(SOCKET_EVENTS.COLUMN.CREATED, payload => {
        // columnCache.create(payload);
        console.log("COLUMN Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COLUMN.UPDATED, payload => {
        // columnCache.update(payload);
        console.log("COLUMN Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COLUMN.REORDERED, payload => {
        // columnCache.reorder(payload);
        console.log("COLUMN Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COLUMN.DELETED, payload => {
        // columnCache.remove(payload);
        console.log("COLUMN Event With Payload : ", payload);

    });
}