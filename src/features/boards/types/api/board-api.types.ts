import type { TaskPriority } from "@/types";
import type { TaskSource, TaskStatus } from "../enums";

export interface ApiUserSummary {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
}

export interface ApiBoardColumn {
    id: string;
    name: string;
    sortOrder: number;
    isProtected: boolean;
    color: string | null;
    createdAt: string;
}
export interface ApiTaskBoardColumn {
    id: string;
    name: string;
    color: string | null;
}


export interface ApiTaskSummary {
    id: string;
    title: string;
    projectId: string;
    columnOrder: number;
    status: TaskStatus;
    priority: TaskPriority;
    boardColumn: ApiTaskBoardColumn;
    createdBy: ApiUserSummary;
    created_at: string;
    updated_at: string;
    assignee: ApiUserSummary | null;
    commentsCount: number;
    subtasksCount: number;
    attachmentsCount: number;
    completedSubtasksCount: number;
    source: TaskSource;
}
export interface ApiTask {
    id: string;
    title: string;
    description: string | null;
    label: string | null;
    deadline: string | null;
    type: string;
    status: TaskStatus;
    priority: TaskPriority;
    columnOrder: number;
    projectId: string;
    boardColumn: ApiTaskBoardColumn;
    createdBy: ApiUserSummary;
    created_at: string;
    updated_at: string;
    assignee: ApiUserSummary | null;
    comments: ApiComment[];
    subtasks: ApiSubtask[];
    attachments: ApiAttachment[];
    commentsCount: number;
    subtasksCount: number;
    attachmentsCount: number;
    completedSubtasksCount: number;
    source: TaskSource;
}
export interface ApiSubtask {
    id: string;
    title: string;
    isCompleted: boolean;
    sortOrder: number;
    created_at: string;
    updated_at: string;
}
export interface ApiComment {
    id: string;
    body: string;
    user: ApiUserSummary;
    created_at: string;
    updated_at: string;
}
export interface ApiTimeLog {
    id: string;
    durationMin: number;
    loggedDate: string;
    note: string;
    user: ApiUserSummary;
    created_at: string;
}
export interface ApiAttachment {
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    size: number;
    uploadedBy: ApiUserSummary;
    created_at: string;
}


// Request DTOs
export interface CreateBoardColumnDto {
    name: string;
    color?: string;
}
export interface UpdateBoardColumnDto {
    name?: string;
    color?: string;
}
export interface ReorderBoardColumnItemDto {
    id: string;
    sortOrder: number;
}

export interface ReorderBoardColumnsDto {
    columns: ReorderBoardColumnItemDto[];
}


export interface CreateTaskDto {
    title: string;

    description?: string;

    label?: string;

    deadline?: string;

    type: string;

    status: string;

    priority: string;
}
export interface UpdateTaskDto {
    title?: string;

    description?: string;

    label?: string;

    deadline?: string;

    status?: string;

    priority?: string;
}

export interface CreateCommentDto {
    body: string;
}
export interface UpdateCommentDto {
    body: string;
}

export interface CreateSubtaskDto {
    title: string;
}
export interface UpdateSubtaskDto {
    title?: string;

    isCompleted?: boolean;
}

export interface CreateTimeLogDto {
    durationMin: number;

    loggedDate: string;

    note?: string;
}




export interface ApiMessageResponse {
    message: string;
}
interface ApiListResponse {
    total: number;
    page: number;
    limit: number;
}
export interface ApiTaskListResponse extends ApiListResponse {
    tasks: ApiTaskSummary[];

}

export interface ApiCommentListResponse extends ApiListResponse {
    comments: ApiComment[];
}

export interface ApiTimeLogListResponse extends ApiListResponse {
    timeLogs: ApiTimeLog[];
}
