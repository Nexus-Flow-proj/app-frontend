// src/lib/socket/types/events.ts
import type {
    TaskCreatedPayload, TaskDeletedPayload, TaskMovedPayload, TaskUpdatedPayload,
    SubtaskCreatedPayload, SubtaskDeletedPayload, SubtaskUpdatedPayload,
    ColumnCreatedPayload, ColumnDeletedPayload, ColumnReorderedPayload, ColumnUpdatedPayload,
    CommentCreatedPayload, CommentDeletedPayload, CommentUpdatedPayload,
    ActivityFeedNewPayload, NotificationNewPayload, PresencePayload
} from "./payloads";
import type { EventMetadata, ProjectPayload } from "./socket.types";
import { SOCKET_EVENTS } from "../constants/socket-events";
export interface ServerToClientEvents {
    // Task Actions
    [SOCKET_EVENTS.TASK.CREATED]: (payload: TaskCreatedPayload) => void;
    [SOCKET_EVENTS.TASK.UPDATED]: (payload: TaskUpdatedPayload) => void;
    [SOCKET_EVENTS.TASK.MOVED]: (payload: TaskMovedPayload) => void;
    [SOCKET_EVENTS.TASK.DELETED]: (payload: TaskDeletedPayload & EventMetadata) => void;

    // Subtask Realtime Synchronization
    [SOCKET_EVENTS.SUBTASK.CREATED]: (payload: SubtaskCreatedPayload) => void;
    [SOCKET_EVENTS.SUBTASK.UPDATED]: (payload: SubtaskUpdatedPayload) => void;
    [SOCKET_EVENTS.SUBTASK.DELETED]: (payload: SubtaskDeletedPayload & EventMetadata) => void;

    // Kanban Column Architecture
    [SOCKET_EVENTS.COLUMN.CREATED]: (payload: ColumnCreatedPayload) => void;
    [SOCKET_EVENTS.COLUMN.UPDATED]: (payload: ColumnUpdatedPayload) => void;
    [SOCKET_EVENTS.COLUMN.DELETED]: (payload: ColumnDeletedPayload & EventMetadata) => void;
    [SOCKET_EVENTS.COLUMN.REORDERED]: (payload: ColumnReorderedPayload & EventMetadata) => void;


    // Project Comments & Feeds
    [SOCKET_EVENTS.COMMENT.CREATED]: (payload: CommentCreatedPayload) => void;
    [SOCKET_EVENTS.COMMENT.UPDATED]: (payload: CommentUpdatedPayload) => void;
    [SOCKET_EVENTS.COMMENT.DELETED]: (payload: CommentDeletedPayload & EventMetadata) => void;

    [SOCKET_EVENTS.NOTIFICATION.NEW]: (payload: NotificationNewPayload) => void;
    [SOCKET_EVENTS.ACTIVITY.NEW]: (payload: ActivityFeedNewPayload) => void;

    // Core Presence 
    [SOCKET_EVENTS.PRESENCE.USER_ONLINE]: (payload: PresencePayload) => void;
    [SOCKET_EVENTS.PRESENCE.USER_OFFLINE]: (payload: PresencePayload) => void;
}

export interface ClientToServerEvents {
    [SOCKET_EVENTS.PROJECT.JOIN]: (payload: ProjectPayload) => void;
    [SOCKET_EVENTS.PROJECT.LEAVE]: (payload: ProjectPayload) => void;
}
