// src/lib/socket/types/events.ts
import type {
    TaskCreatedPayload, TaskDeletedPayload, TaskUpdatedPayload,
    SubtaskCreatedPayload, SubtaskDeletedPayload, SubtaskUpdatedPayload,
    ColumnCreatedPayload, ColumnDeletedPayload, ColumnReorderedPayload, ColumnUpdatedPayload,
    CommentCreatedPayload, CommentDeletedPayload, CommentUpdatedPayload,
    NotificationNewPayload,
    PresenceJoinedPayload,
    PresenceLeftPayload,
    ActivityCreatedPayload,
    NotificationReadAllPayload,
    ChatMessageCreatedPayload,
    ChatMessageUpdatedPayload,
    ChatMessageDeletedPayload,
    ChatMessagePinnedPayload,
    ChatMessageUnpinnedPayload,
    ChatReactionAddedPayload,
    ChatReactionRemovedPayload,
    ChatUserTypingPayload,
    ChatReadPayload,
    ChatTypingEmitPayload,
} from "./payloads";
import type { EventMetadata, ProjectPayload } from "./socket.types";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { AiGenerationEvent } from "@/features/workshop/types";
export interface ServerToClientEvents {
    [SOCKET_EVENTS.AI.GENERATION_CREATED]: (payload: AiGenerationEvent) => void;
    [SOCKET_EVENTS.AI.GENERATION_STARTED]: (payload: AiGenerationEvent) => void;
    [SOCKET_EVENTS.AI.GENERATION_PROGRESS]: (payload: AiGenerationEvent) => void;
    [SOCKET_EVENTS.AI.GENERATION_COMPLETED]: (payload: AiGenerationEvent) => void;
    [SOCKET_EVENTS.AI.GENERATION_FAILED]: (payload: AiGenerationEvent) => void;
    // Task Actions
    [SOCKET_EVENTS.TASK.CREATED]: (payload: TaskCreatedPayload) => void;
    [SOCKET_EVENTS.TASK.UPDATED]: (payload: TaskUpdatedPayload) => void;
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
    [SOCKET_EVENTS.NOTIFICATION.READ_ALL]: (payload: NotificationReadAllPayload) => void;

    [SOCKET_EVENTS.ACTIVITY.NEW]: (payload: ActivityCreatedPayload) => void;

    // Core Presence 
    [SOCKET_EVENTS.PRESENCE.USER_ONLINE]: (payload: PresenceJoinedPayload) => void;
    [SOCKET_EVENTS.PRESENCE.USER_OFFLINE]: (payload: PresenceLeftPayload) => void;

    // Chat Events
    [SOCKET_EVENTS.CHAT.MESSAGE_CREATED]: (payload: ChatMessageCreatedPayload) => void;
    [SOCKET_EVENTS.CHAT.MESSAGE_UPDATED]: (payload: ChatMessageUpdatedPayload) => void;
    [SOCKET_EVENTS.CHAT.MESSAGE_DELETED]: (payload: ChatMessageDeletedPayload) => void;
    [SOCKET_EVENTS.CHAT.MESSAGE_PINNED]: (payload: ChatMessagePinnedPayload) => void;
    [SOCKET_EVENTS.CHAT.MESSAGE_UNPINNED]: (payload: ChatMessageUnpinnedPayload) => void;
    [SOCKET_EVENTS.CHAT.REACTION_ADDED]: (payload: ChatReactionAddedPayload) => void;
    [SOCKET_EVENTS.CHAT.REACTION_REMOVED]: (payload: ChatReactionRemovedPayload) => void;
    [SOCKET_EVENTS.CHAT.USER_TYPING]: (payload: ChatUserTypingPayload) => void;
    [SOCKET_EVENTS.CHAT.READ]: (payload: ChatReadPayload) => void;
}

export interface ClientToServerEvents {
    [SOCKET_EVENTS.PROJECT.JOIN]: (payload: ProjectPayload) => void;
    [SOCKET_EVENTS.PROJECT.LEAVE]: (payload: ProjectPayload) => void;
    [SOCKET_EVENTS.CHAT.TYPING]: (payload: ChatTypingEmitPayload) => void;
}

