import { QUERY_KEYS } from "@/constants";
import { notificationService } from "../services";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { NotificationListResponse } from "../types";

const DEFAULT_LIMIT = 10;

export function useInfiniteNotifications(limit: number = DEFAULT_LIMIT) {
    return useInfiniteQuery<
        NotificationListResponse,
        Error,
        NotificationListResponse,
        ReturnType<typeof QUERY_KEYS.notifications.list>,
        number
    >({
        queryKey: QUERY_KEYS.notifications.list(),
        queryFn: async ({ pageParam }) => {
            const res = await notificationService.getNotifications(pageParam, limit);
            return res.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage;
            return page < totalPages ? page + 1 : undefined;
        },
        select: (data) => {
            // Flatten all pages into a single list + carry forward
            const existedNotificationIds = new Set<string>();
            const firstPage = data.pages[0];
            const latestPage = data.pages[data.pages.length - 1];

            const allNotifications = data.pages.flatMap(
                (page) => page.notifications,
            ).filter(notification => {
                if (existedNotificationIds.has(notification.id))
                    return false;
                existedNotificationIds.add(notification.id);
                return true;
            });

            return {
                notifications: allNotifications,
                unreadCount: firstPage.unreadCount,
                page: latestPage.page,
                limit: firstPage.limit,
                total: firstPage.total,
                totalPages: firstPage.totalPages,
            };
        },
    });
}