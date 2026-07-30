import { notificationService } from "../services";
import { invalidateNotifications, markAllNotificationsAsRead } from "../cache/notification.cache";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useReadAllNotifications() {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn: () => notificationService.readAllNotifications(),

            onMutate: () => {
                markAllNotificationsAsRead(queryClient);
            },
            onError: () => {
                invalidateNotifications(queryClient);
            },
        }
    )
}