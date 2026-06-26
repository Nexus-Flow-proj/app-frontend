import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";

export function registerCommentHandlers(socketManager: SocketManager): void {
    socketManager.on(SOCKET_EVENTS.COMMENT.CREATED, payload => {
        // commentCache.create(payload);
        console.log("COMMENT Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COMMENT.UPDATED, payload => {
        // commentCache.update(payload);
        console.log("COMMENT Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COMMENT.DELETED, payload => {
        // commentCache.remove(payload);
        console.log("COMMENT Event With Payload : ", payload);

    });
}