import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
export function registerPresenceHandlers(socketManager: SocketManager): void {
    socketManager.on(SOCKET_EVENTS.PRESENCE.USER_ONLINE, payload => {
        // presenceCache.userOnline(payload);
        console.log("PRESENCE Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.PRESENCE.USER_OFFLINE, payload => {
        // presenceCache.userOffline(payload);
        console.log("PRESENCE Event With Payload : ", payload);
    });
}