import type {
    ApiAttachment,
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
    TaskAttachment,
    TaskDetail,
    TimeLog,
} from "../types/index";

import type {
    TaskPriority,
    TaskSource,
    TaskStatus,
} from "../types/enums";

function mapBoardMember(user: ApiUserSummary): BoardMember {
    return {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        avatarUrl: user.avatarUrl ?? undefined,
    }
}
function mapComment(comment: ApiComment, taskId: string): Comment {
    return {
        id: comment.id,
        taskId,
        authorId: comment.user.id,
        author: mapBoardMember(comment.user),
        content: comment.body,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
    }
}
function mapSubtask(subtask: ApiSubtask, taskId: string): Subtask {
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

function mapAttachment(attachment: ApiAttachment, taskId: string): TaskAttachment {
    return {
        id: attachment.id,
        taskId,
        name: attachment.fileName,
        url: attachment.fileUrl,
        mimeType: attachment.mimeType,
        size: attachment.size,
        uploadedBy: {
            id: attachment.uploadedBy.id,
            name: attachment.uploadedBy.firstName + " " + attachment.uploadedBy.lastName,
            avatar: attachment.uploadedBy.avatarUrl ?? undefined,
        },
        createdAt: attachment.created_at,
    }
}
export function mapTimeLog(timeLog: ApiTimeLog, taskId: string): TimeLog {
    return {
        id: timeLog.id,
        taskId,
        userId: timeLog.user.id,
        user: {
            id: timeLog.user.id,
            name: `${timeLog.user.firstName} ${timeLog.user.lastName}`,
            avatar: timeLog.user.avatarUrl ?? undefined,
        },
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
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        boardColumnId: task.boardColumn.id,
        columnOrder: task.columnOrder,
        source: task.source as TaskSource,
        createdAt: task.created_at,

        updatedAt: task.updated_at,

        assignee: task.assignee
            ? mapBoardMember(task.assignee)
            : null,

        commentCount: task.commentCount,
        subtaskCount: task.subtaskCount,
        completedSubtaskCount:
            task.completedSubtaskCount,
        attachmentCount: task.attachmentCount,
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
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        boardColumnId: task.boardColumn.id,
        columnOrder: task.columnOrder,
        source: task.source as TaskSource,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        assignee: task.assignee
            ? mapBoardMember(task.assignee)
            : null,
        commentCount: task.commentCount,
        subtaskCount: task.subtaskCount,
        completedSubtaskCount:
            task.completedSubtaskCount,
        attachmentCount: task.attachmentCount,
    };

    return {
        ...summary,

        comments: task.comments.map((comment) =>
            mapComment(comment, task.id),
        ),

        subtasks: task.subtasks.map((subtask) =>
            mapSubtask(subtask, task.id),
        ),

        attachments: task.attachments.map((attachment) =>
            mapAttachment(attachment, task.id),
        ),
        activityLog: [],// TODO: Confirm with backend whether activity log is a separate endpoint or the same as time logs.
    };
}