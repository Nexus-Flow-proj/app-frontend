import { markUserOffline, markUserOnline } from "@/features/project/cache/project-members.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import type { QueryClient } from "@tanstack/react-query";
export function registerPresenceHandlers(socketManager: SocketManager, qc: QueryClient): void {
    socketManager.on(SOCKET_EVENTS.PRESENCE.USER_ONLINE, payload => {
        const { projectId, userId } = payload
        markUserOnline(qc, projectId, userId)
        console.log("PRESENCE Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.PRESENCE.USER_OFFLINE, payload => {
        const { projectId, userId } = payload
        markUserOffline(qc, projectId, userId)
        console.log("PRESENCE Event With Payload : ", payload);
    });
}