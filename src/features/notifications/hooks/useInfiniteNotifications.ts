import { QUERY_KEYS } from "@/constants";
import { notificationService } from "../services";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { NotificationListResponse } from "../types";
import type { ApiResponse } from "@/types";

const DEFAULT_LIMIT = 10;

export function useInfiniteNotifications(limit: number = DEFAULT_LIMIT) {
    return useInfiniteQuery<
        ApiResponse<NotificationListResponse>,
        Error,
        NotificationListResponse,
        ReturnType<typeof QUERY_KEYS.notifications.list>,
        number
    >({
        queryKey: QUERY_KEYS.notifications.list(),
        queryFn: ({ pageParam }) =>
            notificationService.getNotifications(pageParam, limit),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.data;
            return page < totalPages ? page + 1 : undefined;
        },
        select: (data) => {
            // Flatten all pages into a single list + carry forward
            // unreadCount from the most recent page
            const existedNotificationIds = new Set<string>();
            const firstPage = data.pages[0];
            const latestPage = data.pages[data.pages.length - 1];

            const allNotifications = data.pages.flatMap(
                (page) => page.data.notifications,
            ).filter(notification => {
                if (existedNotificationIds.has(notification.id))
                    return false;
                existedNotificationIds.add(notification.id);
                return true;
            });

            return {
                notifications: allNotifications,
                unreadCount: firstPage.data.unreadCount,
                page: latestPage.data.page,
                limit: firstPage.data.limit,
                total: firstPage.data.total,
                totalPages: firstPage.data.totalPages,
            };
        },
    });
}