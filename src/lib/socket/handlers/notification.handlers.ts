import { addNotificationToCache, markAllNotificationsAsRead } from "@/features/notifications/cache/notification.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function registerNotificationHandlers(socketManager: SocketManager, qc: QueryClient): void {
    socketManager.on(SOCKET_EVENTS.NOTIFICATION.NEW, payload => {
        addNotificationToCache(qc, payload.notification)
        toast(payload.notification.title, {
            description: payload.notification.message,
        });
        console.log("NOTIFICATION Event With Payload : ", payload);
    });
    socketManager.on(SOCKET_EVENTS.NOTIFICATION.READ_ALL, payload => {
        markAllNotificationsAsRead(qc)
        console.log("NOTIFICATION Event With Payload : ", payload);
    });
}