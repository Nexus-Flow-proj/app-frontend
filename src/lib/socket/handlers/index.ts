import type { SocketManager } from "../socket-manager";
import { registerActivityHandlers } from "./activity.handlers";
import { registerColumnHandlers } from "./column.handlers";
import { registerCommentHandlers } from "./comment.handlers";
import { registerNotificationHandlers } from "./notification.handlers";
import { registerPresenceHandlers } from "./presence.handlers";
import { registerTaskHandlers } from "./task.handlers";

let handlersRegistered: boolean = false;

export function registerAllHandlers(socketManager: SocketManager): void {
    if (handlersRegistered) return;
    handlersRegistered = true;
    registerTaskHandlers(socketManager);
    registerColumnHandlers(socketManager);
    registerCommentHandlers(socketManager);
    registerNotificationHandlers(socketManager);
    registerActivityHandlers(socketManager);
    registerPresenceHandlers(socketManager);
}