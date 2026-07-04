import { addCommentToCache, removeCommentFromCache, updateCommentInCache } from "@/features/boards/cache/task-detail.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import { mapComment } from "@/features/boards/mappers";
import type { QueryClient } from "@tanstack/react-query";

export function registerCommentHandlers(socketManager: SocketManager, qc: QueryClient): void {
    socketManager.on(SOCKET_EVENTS.COMMENT.CREATED, payload => {
        const createdComment = mapComment(payload.comment, payload.taskId);
        addCommentToCache(qc, payload.taskId, createdComment);
        console.log("COMMENT Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COMMENT.UPDATED, payload => {
        const updatedComment = mapComment(payload.comment, payload.taskId);
        updateCommentInCache(qc, payload.taskId, updatedComment);
        console.log("COMMENT Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.COMMENT.DELETED, async (payload) => {
        await removeCommentFromCache(qc, payload.taskId, payload.commentId);
        console.log("COMMENT Event With Payload : ", payload.commentId);

    });
}