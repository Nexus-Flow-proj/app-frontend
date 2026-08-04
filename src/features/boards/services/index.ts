import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
    ApiBoardColumn, ApiComment, ApiCommentListResponse, ApiMessageResponse,
    ApiSubtask, ApiTask, ApiTaskAssigneeRecommendation, ApiTaskListResponse,
    ApiTaskAttachmentsMutationResponse, ApiTimeLog, ApiTimeLogListResponse,
    CreateBoardColumnDto, CreateCommentDto,
    CreateSubtaskDto, CreateTaskDto, CreateTimeLogDto,
    ReorderBoardColumnsDto, UpdateBoardColumnDto, UpdateCommentDto,
    UpdateSubtaskDto, UpdateTaskDto

} from "../types/api/board-api.types";


export const boardService = {
    // ── Boards ──────────────────────────────────────────────────────────
    getBoardColumns: (projectId: string) =>
        api
            .get<ApiResponse<ApiBoardColumn[]>>(`/projects/${projectId}/boards`)
            .then(res => res.data),

    createColumn: (projectId: string, dto: CreateBoardColumnDto) =>
        api
            .post<ApiResponse<ApiBoardColumn>>(`/projects/${projectId}/boards`, dto)
            .then(res => res.data),

    updateColumn: (columnId: string, dto: UpdateBoardColumnDto) =>
        api
            .patch<ApiResponse<ApiBoardColumn>>(`/boards/${columnId}`, dto)
            .then(res => res.data),

    deleteColumn: (columnId: string) =>
        api
            .delete<ApiResponse<ApiMessageResponse>>(`/boards/${columnId}`)
            .then(res => res.data),

    reorderColumns: (projectId: string, dto: ReorderBoardColumnsDto) =>
        api
            .patch<ApiResponse<ApiBoardColumn[]>>(`/projects/${projectId}/boards/reorder`, dto)
            .then(res => res.data),
}

export const taskService = {

    // ── Tasks ──────────────────────────────────────────────────────────
    getProjectTasks: (projectId: string) =>
        api
            .get<ApiResponse<ApiTaskListResponse>>(`/projects/${projectId}/tasks`)
            .then(res => res.data),

    getTask: (taskId: string) =>
        api
            .get<ApiResponse<ApiTask>>(`/tasks/${taskId}`)
            .then(res => res.data),
    getAiAssigneeRecommendation: (projectId: string, taskId: string) =>
        api
            .get<ApiResponse<ApiTaskAssigneeRecommendation>>(
                `/projects/${projectId}/tasks/${taskId}/ai/assign`,
            )
            .then(res => res.data),
    createTask: (projectId: string, columnId: string, dto: CreateTaskDto) =>
        api
            .post<ApiResponse<ApiTask>>(`/projects/${projectId}/tasks/${columnId}`, dto)
            .then(res => res.data),

    updateTask: (taskId: string, dto: UpdateTaskDto) =>
        api
            .patch<ApiResponse<ApiTask>>(`/tasks/${taskId}`, dto)
            .then(res => res.data),
    deleteTask: (taskId: string) =>
        api
            .delete<ApiResponse<ApiMessageResponse>>(`/tasks/${taskId}`)
            .then(res => res.data),
    uploadAttachments: (taskId: string, files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        return api
            .post<ApiResponse<ApiTaskAttachmentsMutationResponse>>(
                `/tasks/${taskId}/attachments`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            )
            .then(res => res.data);
    },
    deleteAttachment: (taskId: string, attachmentId: string) =>
        api
            .delete<ApiResponse<ApiTaskAttachmentsMutationResponse>>(
                `/tasks/${taskId}/attachments/${attachmentId}`,
            )
            .then(res => res.data),

    // ── Comments ───────────────────────────────────────────────────────

    getComments: (taskId: string) =>
        api
            .get<ApiResponse<ApiCommentListResponse>>(`/tasks/${taskId}/comments`)
            .then((r) => r.data),

    createComment: (taskId: string, dto: CreateCommentDto) =>
        api
            .post<ApiResponse<ApiComment>>(`/tasks/${taskId}/comments`, dto)
            .then((r) => r.data),

    updateComment: (commentId: string, dto: UpdateCommentDto) =>
        api
            .patch<ApiResponse<ApiComment>>(`/comments/${commentId}`, dto)
            .then((r) => r.data),

    deleteComment: (commentId: string) =>
        api
            .delete<ApiResponse<ApiMessageResponse>>(`/comments/${commentId}`)
            .then((r) => r.data),

    // ── Subtasks ──────────────────────────────────────────────────────

    createSubtask: (taskId: string, dto: CreateSubtaskDto) =>
        api
            .post<ApiResponse<ApiSubtask>>(`/tasks/${taskId}/subtasks`, dto)
            .then((r) => r.data),

    deleteSubtask: (taskId: string, subtaskId: string) =>
        api
            .delete<ApiResponse<ApiMessageResponse>>(`/tasks/${taskId}/subtasks/${subtaskId}`)
            .then((r) => r.data),

    updateSubtask: (taskId: string, subtaskId: string, dto: UpdateSubtaskDto) =>
        api
            .patch<ApiResponse<ApiSubtask>>(`/tasks/${taskId}/subtasks/${subtaskId}`, dto)
            .then((r) => r.data),

    // ── Time Logs ──────────────────────────────────────────────────────

    getTimeLogs: (taskId: string) =>
        api
            .get<ApiResponse<ApiTimeLogListResponse>>(`/tasks/${taskId}/time-logs`)
            .then((r) => r.data),

    createTimeLog: (taskId: string, dto: CreateTimeLogDto) =>
        api
            .post<ApiResponse<ApiTimeLog>>(`/tasks/${taskId}/time-logs`, dto)
            .then((r) => r.data),

    deleteTimeLog: (timeLogId: string) =>
        api
            .delete<ApiResponse<ApiMessageResponse>>(`/time-logs/${timeLogId}`)
            .then((r) => r.data),
};
