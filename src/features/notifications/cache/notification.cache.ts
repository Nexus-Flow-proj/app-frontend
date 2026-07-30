import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

import type { NotificationListResponse } from "../types";
import type { Notification } from "@/types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type InfiniteNotificationsData = InfiniteData<
    NotificationListResponse,
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
        pages: old.pages.map((page) => fn(page)),
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
            const existed = old.pages.some(page => page.notifications.some(n => n.id === notification.id))
            if (existed) return;
            // Prepend to the first page so it appears at the top
            const [firstPage, ...rest] = old.pages;

            const updatedFirstPage: NotificationListResponse = {
                ...firstPage,
                notifications: [notification, ...firstPage.notifications],
                unreadCount: (firstPage.unreadCount ?? 0) + 1,
                total: firstPage.total + 1,
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

            const updated = mapPages(old, (page) => {
                const removedNotification = page.notifications.find(
                    n => n.id === notificationId,
                );

                const filtered = page.notifications.filter(
                    n => n.id !== notificationId,
                );

                return {
                    ...page,
                    notifications: filtered,
                    total:
                        removedNotification
                            ? page.total - 1
                            : page.total,
                    unreadCount:
                        removedNotification && !removedNotification.isRead
                            ? Math.max(page.unreadCount - 1, 0)
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