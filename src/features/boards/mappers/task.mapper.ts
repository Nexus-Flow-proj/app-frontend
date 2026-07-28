import type {
    ApiComment,
    ApiSubtask,
    ApiTask,
    ApiTaskSummary,
    ApiTimeLog,
    ApiUserSummary,
} from "../types/api/board-api.types";

import type {
    BoardMember,
    Comment,
    Subtask,
    Task,
    TaskDetail,
    TimeLog,
} from "../types/index";

import type {
    TaskPriority,
    TaskSource,
    TaskStatus,
} from "../types/enums";
import {
    TaskPriority as BoardTaskPriority,
    TaskSource as BoardTaskSource,
    TaskStatus as BoardTaskStatus,
} from "../types/enums";

export function normalizeTaskPriority(priority: unknown): TaskPriority {
    const normalized = String(priority ?? "").toUpperCase();

    return Object.values(BoardTaskPriority).includes(normalized as TaskPriority)
        ? normalized as TaskPriority
        : BoardTaskPriority.MEDIUM;
}

export function normalizeTaskStatus(status: unknown): TaskStatus {
    const normalized = String(status ?? "").toUpperCase();

    return Object.values(BoardTaskStatus).includes(normalized as TaskStatus)
        ? normalized as TaskStatus
        : BoardTaskStatus.TODO;
}

export function normalizeTaskSource(source: unknown): TaskSource {
    const normalized = String(source ?? "").toUpperCase();

    return Object.values(BoardTaskSource).includes(normalized as TaskSource)
        ? normalized as TaskSource
        : BoardTaskSource.MANUAL;
}

export function mapBoardMember(user: ApiUserSummary | null | undefined): BoardMember {
    if (!user) {
        return {
            id: "unknown-user",
            name: "Unknown user",
        };
    }

    const firstName = user.firstName ?? user.first_name ?? "";
    const lastName = user.lastName ?? user.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();
    const name = user.name ?? (fullName || user.email || "Unknown user");

    return {
        id: user.id,
        name,
        avatarUrl: user.avatarUrl ?? undefined,
    }
}

function hasUserDisplayName(user: ApiUserSummary | null | undefined) {
    return Boolean(
        user?.name ||
        user?.firstName ||
        user?.lastName ||
        user?.first_name ||
        user?.last_name ||
        user?.email,
    );
}

export function mapComment(
    comment: ApiComment,
    taskId: string,
    fallbackAuthor?: BoardMember,
): Comment {
    const author =
        hasUserDisplayName(comment.user) || !fallbackAuthor
            ? mapBoardMember(comment.user)
            : fallbackAuthor;

    return {
        id: comment.id,
        taskId,
        authorId: comment.user?.id,
        author,
        content: comment.body,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
    }
}
export function mapSubtask(subtask: ApiSubtask, taskId: string): Subtask {
    return {
        id: subtask.id,
        taskId,
        title: subtask.title,
        completed: subtask.isCompleted,
        position: subtask.sortOrder,
        createdAt: subtask.created_at,
        updatedAt: subtask.updated_at,
    }
}

// function mapAttachment(attachment: TaskAttachment, taskId: string): TaskAttachment {
//     return {
//         id: attachment.id,
//         taskId,
//         name: attachment.fileName,
//         url: attachment.fileUrl,
//         mimeType: attachment.mimeType,
//         size: attachment.size,
//         uploadedBy: {
//             id: attachment.uploadedBy.id,
//             name: attachment.uploadedBy.firstName + " " + attachment.uploadedBy.lastName,
//             avatar: attachment.uploadedBy.avatarUrl ?? undefined,
//         },
//         createdAt: attachment.created_at,
//     }
// }
export function mapTimeLog(
    timeLog: ApiTimeLog,
    taskId: string,
    fallbackUser?: BoardMember,
): TimeLog {
    const user =
        hasUserDisplayName(timeLog.user) || !fallbackUser
            ? mapBoardMember(timeLog.user)
            : fallbackUser;

    return {
        id: timeLog.id,
        taskId,
        userId: timeLog.user?.id ?? user.id,
        user,
        minutes: timeLog.durationMin,
        description: timeLog.note,
        loggedAt: timeLog.loggedDate,
        createdAt: timeLog.created_at,
    };
}
export function mapTaskSummary(task: ApiTaskSummary): Task {
    return {
        id: task.id,
        projectId: task.projectId,
        createdBy: task.createdBy.id,
        title: task.title,
        status: normalizeTaskStatus(task.status),
        priority: normalizeTaskPriority(task.priority),
        boardColumnId: task.boardColumn.id,
        columnOrder: task.columnOrder,
        source: normalizeTaskSource(task.source),
        createdAt: task.created_at,

        updatedAt: task.updated_at,

        assignee: task.assignee
            ? mapBoardMember(task.assignee)
            : null,
        commentsCount: task.commentsCount,
        subtasksCount: task.subtasksCount,
        completedSubtasksCount: task.completedSubtasksCount,
        attachmentsCount: task.attachmentsCount,
        description: task.description ?? undefined,
        dueDate: task.deadline ?? undefined,
        tags: task.label ? [task.label] : [],

    };
}
export function mapTaskDetail(
    task: ApiTask,
): TaskDetail {
    const summary: Task = {
        id: task.id,
        projectId: task.projectId,
        createdBy: task.createdBy.id,
        title: task.title,
        description: task.description ?? undefined,
        dueDate: task.deadline ?? undefined,
        status: normalizeTaskStatus(task.status),
        priority: normalizeTaskPriority(task.priority),
        boardColumnId: task.boardColumn.id,
        columnOrder: task.columnOrder,
        source: normalizeTaskSource(task.source),
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        assignee: task.assignee
            ? mapBoardMember(task.assignee)
            : null,
        commentsCount: task.commentsCount,
        subtasksCount: task.subtasksCount,
        completedSubtasksCount:
            task.completedSubtasksCount,
        attachmentsCount: task.attachmentsCount,
        tags: task.label ? [task.label] : [],
    };

    return {
        ...summary,

        comments: task.comments.map((comment) =>
            mapComment(comment, task.id),
        ),

        subtasks: task.subtasks.map((subtask) =>
            mapSubtask(subtask, task.id),
        ),

        attachments: task.attachments,

        activityLog: [],// TODO: Confirm with backend whether activity log is a separate endpoint or the same as time logs.
    };
}
