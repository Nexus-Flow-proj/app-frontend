import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

import type { NotificationListResponse } from "../types";
import type { ApiResponse, Notification } from "@/types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type InfiniteNotificationsData = InfiniteData<
    ApiResponse<NotificationListResponse>,
    number
>;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getNotificationsKey() {
    return QUERY_KEYS.notifications.list();
}

/**
 * Map over every page inside the infinite cache, applying `fn`
 * to each page's `NotificationListResponse`.
 */
function mapPages(
    old: InfiniteNotificationsData,
    fn: (page: NotificationListResponse) => NotificationListResponse,
): InfiniteNotificationsData {
    return {
        ...old,
        pages: old.pages.map((page) => ({
            ...page,
            data: fn(page.data),
        })),
    };
}

// ─────────────────────────────────────────────────────────────
// Add Notification (e.g. from a socket event)
// ─────────────────────────────────────────────────────────────

export function addNotificationToCache(
    qc: QueryClient,
    notification: Notification,
) {
    qc.setQueryData<InfiniteNotificationsData>(
        getNotificationsKey(),
        (old) => {
            if (!old || old.pages.length === 0) return old;

            // Prepend to the first page so it appears at the top
            const [firstPage, ...rest] = old.pages;

            const updatedFirstPage: ApiResponse<NotificationListResponse> = {
                ...firstPage,
                data: {
                    ...firstPage.data,
                    notifications: [notification, ...firstPage.data.notifications],
                    unreadCount: (firstPage.data.unreadCount ?? 0) + 1,
                    total: firstPage.data.total + 1,
                },
            };

            return {
                ...old,
                pages: [updatedFirstPage, ...rest],
            };
        },
    );
}

// ─────────────────────────────────────────────────────────────
// Mark All As Read
// ─────────────────────────────────────────────────────────────

export function markAllNotificationsAsRead(
    qc: QueryClient,
) {
    qc.setQueryData<InfiniteNotificationsData>(
        getNotificationsKey(),
        (old) => {
            if (!old) return old;

            return mapPages(old, (page) => ({
                ...page,
                notifications: page.notifications.map((n) => ({
                    ...n,
                    isRead: true,
                })),
                unreadCount: 0,
            }));
        },
    );
}


// ─────────────────────────────────────────────────────────────
// Remove Notification
// ─────────────────────────────────────────────────────────────

export function removeNotificationFromCache(
    qc: QueryClient,
    notificationId: string,
) {
    qc.setQueryData<InfiniteNotificationsData>(
        getNotificationsKey(),
        (old) => {
            if (!old) return old;

            let wasUnread = false;

            const updated = mapPages(old, (page) => {
                const filtered = page.notifications.filter((n) => {
                    if (n.id === notificationId) {
                        wasUnread = !n.isRead;
                        return false;
                    }
                    return true;
                });

                return {
                    ...page,
                    notifications: filtered,
                    total: page.total - (filtered.length < page.notifications.length ? 1 : 0),
                    unreadCount: wasUnread
                        ? Math.max(0, (page.unreadCount ?? 0) - 1)
                        : page.unreadCount,
                };
            });

            return updated;
        },
    );
}

// ─────────────────────────────────────────────────────────────
// Invalidate (full refetch)
// ─────────────────────────────────────────────────────────────

export function invalidateNotifications(
    qc: QueryClient,
) {
    qc.invalidateQueries({
        queryKey: getNotificationsKey(),
    });
}