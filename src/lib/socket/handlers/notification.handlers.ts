import { addNotificationToCache, markAllNotificationsAsRead } from "@/features/notifications/cache/notification.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ROUTES } from "@/constants";

export function registerNotificationHandlers(socketManager: SocketManager, qc: QueryClient): void {
    socketManager.on(SOCKET_EVENTS.NOTIFICATION.NEW, payload => {
        addNotificationToCache(qc, payload.notification);

        const notif = payload.notification;
        const inviteToken = notif?.metadata?.inviteToken;
        const isInvitation = notif?.type === "INVITATION_RECEIVED";
        toast(notif.title, {
            description: notif.message,
            position: "bottom-right",
            action: isInvitation && inviteToken ? {
                label: "View",
                onClick: () => {
                    window.location.href = ROUTES.PROJECT_INVITATION(inviteToken);
                },
            } : undefined,
        });
        console.log("NOTIFICATION Event With Payload : ", payload);
    });
    socketManager.on(SOCKET_EVENTS.NOTIFICATION.READ_ALL, payload => {
        markAllNotificationsAsRead(qc);
        console.log("NOTIFICATION Event With Payload : ", payload);
    });
}