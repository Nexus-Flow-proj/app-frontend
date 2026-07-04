import { useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services";
import { useApiMutation } from "@/hooks/useApiMutation";
import { removeTimeLogFromCache } from "../cache/time-logs.cache";

export function useDeleteTimeLog(taskId: string) {
    const queryClient = useQueryClient();
    return useApiMutation(
        (timeLogId: string) =>
            taskService.deleteTimeLog(timeLogId),
        {
            onSuccess: (_, timeLogId) => {
                removeTimeLogFromCache(
                    queryClient,
                    taskId,
                    timeLogId,
                );
            }
        }
    )
}