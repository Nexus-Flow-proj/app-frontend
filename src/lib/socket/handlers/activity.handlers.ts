import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
export function registerActivityHandlers(socketManager: SocketManager): void {
    socketManager.on(SOCKET_EVENTS.ACTIVITY.NEW, payload => {
        // activityCache.create(payload);
        console.log("Activity Event With Payload : ", payload);

    });
}