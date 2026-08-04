import type { TaskPriority } from "@/types";
import type { TaskSource, TaskStatus } from "../enums";
import type { TaskAttachment } from "..";

export interface ApiUserSummary {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
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
    dependencyIds?: string[];
    dependencies?: Array<string | { id: string }>;
    columnOrder: number;
    status: TaskStatus;
    priority: TaskPriority;
    boardColumn: ApiBoardColumn;
    createdBy: ApiUserSummary;
    created_at: string;
    updated_at: string;
    assignee: ApiUserSummary | null;
    commentsCount: number;
    subtasksCount: number;
    attachmentsCount: number;
    completedSubtasksCount: number;
    source: TaskSource;
    label: string | null;
    description: string | null;
    deadline: string | null;
    type: string;
}
export interface ApiTask {
    id: string;
    title: string;
    projectId: string;
    dependencyIds?: string[];
    dependencies?: Array<string | { id: string }>;
    columnOrder: number;
    status: TaskStatus;
    priority: TaskPriority;
    boardColumn: ApiBoardColumn;
    createdBy: ApiUserSummary;
    created_at: string;
    updated_at: string;
    assignee: ApiUserSummary | null;
    commentsCount: number;
    subtasksCount: number;
    attachmentsCount: number;
    completedSubtasksCount: number;
    source: TaskSource;
    label: string | null;
    description: string | null;
    deadline: string | null;
    type: string;
    attachments: TaskAttachment[];
    comments: ApiComment[];
    subtasks: ApiSubtask[];
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
    user?: ApiUserSummary | null;
    created_at: string;
    updated_at?: string;
}
export interface ApiTimeLog {
    id: string;
    durationMin: number;
    loggedDate: string;
    note?: string;
    user?: ApiUserSummary | null;
    created_at: string;
}
// export interface ApiAttachment {
//     id: string;
//     fileName: string;
//     fileUrl: string;
//     mimeType: string;
//     size: number;
//     uploadedBy: ApiUserSummary;
//     created_at: string;
// }


export interface TaskUpdatedData {
    id?: string;
    title?: string;
    projectId?: string;
    dependencyIds?: string[];
    dependencies?: Array<string | { id: string }>;
    columnOrder?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    boardColumn?: ApiBoardColumn;
    createdBy?: ApiUserSummary;
    created_at?: string;
    updated_at?: string;
    assignee?: ApiUserSummary | null;
    commentsCount?: number;
    subtasksCount?: number;
    attachmentsCount?: number;
    completedSubtasksCount?: number;
    source?: TaskSource;
    label?: string | null;
    description?: string | null;
    deadline?: string | null;
    type?: string;
    attachments?: TaskAttachment[];
}

// Request DTOs
export interface CreateBoardColumnDto {
    name: string;
    color?: string;
}
export interface UpdateBoardColumnDto {
    name?: string;
    sortOrder?: number;
    color?: string;
}
// export interface ReorderBoardColumnItemDto {
//     id: string;
//     sortOrder: number;
// }

export interface ReorderBoardColumnsDto {
    columns: {
        id: string;
        sortOrder: number;
    }[];
}


export interface CreateTaskDto {
    title: string;
    dependencyIds?: string[];
    description?: string;
    label?: string;
    deadline?: string;
    type: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string;
}
export interface UpdateTaskDto {
    title?: string;

    description?: string;

    dependencyIds?: string[];

    label?: string;

    deadline?: string;

    status?: TaskStatus;

    priority?: TaskPriority;

    assigneeId?: string | null;

    boardColumnId?: string;

    columnOrder?: number;
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

    completed?: boolean;
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
