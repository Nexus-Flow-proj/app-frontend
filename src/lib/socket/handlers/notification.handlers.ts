import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";

export function registerNotificationHandlers(socketManager: SocketManager): void {
    socketManager.on(SOCKET_EVENTS.NOTIFICATION.NEW, payload => {
        // notificationCache.create(payload);
        console.log("NOTIFICATION Event With Payload : ", payload);
    });
}