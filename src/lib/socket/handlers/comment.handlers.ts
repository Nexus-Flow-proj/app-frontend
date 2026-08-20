import { addCommentToCache, removeCommentFromCache, updateCommentInCache } from "@/features/boards/cache/task-detail.cache";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import { mapComment } from "@/features/boards/mappers";
import type { QueryClient } from "@tanstack/react-query";
import { HighlightEntity, useHighlightStore } from "@/store/highlight.store";

const REALTIME_EXIT_MS = 220;

export function registerCommentHandlers(socketManager: SocketManager, qc: QueryClient): void {
    socketManager.on(SOCKET_EVENTS.COMMENT.CREATED, payload => {
        const createdComment = mapComment(payload.comment, payload.taskId);
        useHighlightStore
            .getState()
            .highlight(HighlightEntity.comment, createdComment.id, 900);
        addCommentToCache(qc, payload.taskId, createdComment);
        console.log("COMMENT Event With Payload : ", payload);

    });

    socketManager.on(SOCKET_EVENTS.COMMENT.UPDATED, payload => {
        const updatedComment = mapComment(payload.comment, payload.taskId);
        updateCommentInCache(qc, payload.taskId, updatedComment);
        console.log("COMMENT Event With Payload : ", payload);
    });

    socketManager.on(SOCKET_EVENTS.COMMENT.DELETED, (payload) => {
        useHighlightStore
            .getState()
            .markRemoving(HighlightEntity.comment, payload.commentId, REALTIME_EXIT_MS + 80);
        setTimeout(() => {
            removeCommentFromCache(qc, payload.taskId, payload.commentId);
        }, REALTIME_EXIT_MS);
        console.log("COMMENT Event With Payload : ", payload.commentId);

    });
}
