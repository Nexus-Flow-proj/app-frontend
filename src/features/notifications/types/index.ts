import type { Notification } from "@/types";

interface ApiListResponse {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface NotificationListResponse extends ApiListResponse {
    notifications: Notification[];
    unreadCount: number;
}
export interface NotificationReadAllResponse {
    unreadCount: number;
}