import type { ApiUserSummary } from "@/features/boards/types/api/board-api.types";

interface ApiListResponse {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface ActivityLog {
    id: string;

    actor: ApiUserSummary;

    message: string;

    projectId: string;
    projectName: string;

    entityType: string;
    entityId: string;

    created_at: string;
}

export interface ProjectActivityListResponse extends ApiListResponse {
    activities: ActivityLog[];
}
