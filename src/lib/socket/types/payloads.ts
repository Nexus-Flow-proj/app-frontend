// src/lib/socket/types/payloads.ts
// import type {
//     TaskStatus,
//     TaskPriority,
// } from "@/features/boards/types/enums";
import type { NotificationType } from "@/types/enums";
import type { BoardColumn, Task, Subtask, Comment } from '@/features/boards/types/index'

// COLUMNS PAYLOADS
export interface ColumnCreatedPayload {
    projectId: string;
    column: BoardColumn;
}
export interface ColumnUpdatedPayload {
    projectId: string;
    columnId: string;
    name: string;
}
export interface ColumnDeletedPayload {
    projectId: string;
    columnId: string;
}
export interface ColumnReorderedPayload {
    projectId: string;
    columns: {
        id: string;
        sortOrder: number;
    }[];
}
// TASKS PAYLOADS
export interface TaskCreatedPayload {
    projectId: string;
    task: Task;
    createdBy: {
        id: string;
        name: string;
    };
}
export interface TaskUpdatedPayload {
    projectId: string;
    task: Task
    updatedBy: {
        id: string;
        name: string;
    };
}
export interface TaskMovedPayload {
    projectId: string;
    taskId: string;
    fromColumnId: string;
    toColumnId: string;
    previousPosition: number;
    newPosition: number;
    updatedBy: {
        id: string;
        name: string;
    };
    updatedAt: string;
}
export interface TaskDeletedPayload {
    projectId: string;
    taskId: string;
    deletedBy: {
        id: string;
        name: string;
    };
}
// SUBTASKS PAYLOADS
export interface SubtaskCreatedPayload {
    projectId: string;
    taskId: string;
    subtask: Subtask;
}
export interface SubtaskUpdatedPayload {
    projectId: string;
    taskId: string;
    subtaskId: string;
    title?: string;
    completed?: boolean;
}
export interface SubtaskDeletedPayload {
    projectId: string;
    taskId: string;
    subtaskId: string;
}
// COMMENTS PAYLOADS
export interface CommentCreatedPayload {
    projectId: string;
    taskId: string;
    comment: Comment;
}
export interface CommentUpdatedPayload {
    projectId: string;
    taskId: string;
    commentId: string;
    content: string;
    updatedAt: string;
}
export interface CommentDeletedPayload {
    projectId: string;
    taskId: string;
    commentId: string;
}

// NOTIFICATIONS PAYLOADS
export interface NotificationNewPayload {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    actor?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    metadata: {
        projectId?: string;
        taskId?: string;
        commentId?: string;
        invitationId?: string;
    };
    isRead: boolean;
    createdAt: string;
}
// ACTIVITY PAYLOADS
export interface ActivityFeedNewPayload {
    id: string;
    projectId: string;
    actor: {
        id: string;
        name: string;
    };
    type:
    | "task_created"
    | "task_updated"
    | "task_moved"
    | "task_deleted"

    | "comment_created"
    | "comment_updated"
    | "comment_deleted"

    | "column_created"
    | "column_updated"
    | "column_deleted"
    | "column_reordered"

    | "member_added"
    | "member_removed"

    targetId: string;
    createdAt: string;
}
// PRESENCE PAYLOADS
export interface PresencePayload {
    userId: string;
    userName: string;
}
