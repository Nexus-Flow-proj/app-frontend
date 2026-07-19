import type { QueryClient } from "@tanstack/react-query";
import type { SocketManager } from "../socket-manager";
// import { registerActivityHandlers } from "./activity.handlers";
import { registerColumnHandlers } from "./column.handlers";
import { registerCommentHandlers } from "./comment.handlers";
import { registerNotificationHandlers } from "./notification.handlers";
import { registerPresenceHandlers } from "./presence.handlers";
import { registerTaskHandlers } from "./task.handlers";
import { registerSubtaskHandlers } from "./subtask.handler";

let handlersRegistered: boolean = false;

export function registerAllHandlers(socketManager: SocketManager, qc: QueryClient): void {
    if (handlersRegistered) return;
    handlersRegistered = true;
    registerTaskHandlers(socketManager, qc);
    registerColumnHandlers(socketManager, qc);
    registerCommentHandlers(socketManager, qc);
    registerSubtaskHandlers(socketManager, qc);
    registerPresenceHandlers(socketManager, qc);
    registerNotificationHandlers(socketManager, qc);
    // registerActivityHandlers(socketManager);
}