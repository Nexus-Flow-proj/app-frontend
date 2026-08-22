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
        const { projectId, taskId, inviteToken } = notif.metadata || {};
        const type = notif.type;
        const canOpenInvite =
            inviteToken && (type === "INVITATION_RECEIVED" || type === "INVITE_EXPIRED");
        const canOpenNotificationTarget = canOpenInvite || projectId;

        const action =
            canOpenNotificationTarget
                ? {
                    label: "View",
                    onClick: async () => {
                        const { default: router } = await import("@/router");

                        if (canOpenInvite) {
                            router.navigate(ROUTES.PROJECT_INVITATION(inviteToken));
                            return;
                        }

                        if (!projectId) return;

                        if (type.startsWith("INVITATION_")) {
                            router.navigate(ROUTES.PROJECT_OVERVIEW(projectId));
                            return;
                        }

                        const search = taskId ? `?task=${encodeURIComponent(taskId)}` : "";
                        router.navigate(`${ROUTES.BOARDS(projectId)}${search}`);
                    },
                }
                : undefined;

        toast(notif.title, {
            description: notif.message,
            position: "bottom-right",
            action,
        });
        console.log("NOTIFICATION Event With Payload : ", payload);
    });
    socketManager.on(SOCKET_EVENTS.NOTIFICATION.READ_ALL, payload => {
        markAllNotificationsAsRead(qc);
        console.log("NOTIFICATION Event With Payload : ", payload);
    });
}
