import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type { NotificationListResponse, NotificationReadAllResponse } from "../types";


export const notificationService = {
    getNotifications: (page: number, limit: number) =>
        api
            .get<ApiResponse<NotificationListResponse>>(`/notifications`, { params: { page, limit } })
            .then(res => res.data),

    readAllNotifications: () =>
        api
            .patch<ApiResponse<NotificationReadAllResponse>>(`/notifications/read-all`)
            .then(res => res.data),
}