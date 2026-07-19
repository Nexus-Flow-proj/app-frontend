import { useApiMutation } from "@/hooks/useApiMutation";
import { notificationService } from "../services";
import { invalidateNotifications, markAllNotificationsAsRead } from "../cache/notification.cache";
import { useQueryClient } from "@tanstack/react-query";

export function useReadAllNotifications() {
    const queryClient = useQueryClient();
    return useApiMutation(
        () => notificationService.readAllNotifications(),
        {
            onMutate: () => {
                markAllNotificationsAsRead(queryClient);
            },
            onError: () => {
                invalidateNotifications(queryClient);
            },
        }
    )
}