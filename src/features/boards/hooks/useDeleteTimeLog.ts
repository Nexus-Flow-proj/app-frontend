import { useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services";
import { useApiMutation } from "@/hooks/useApiMutation";
import {
    removeTimeLogFromCacheOptimistically,
    rollbackTimeLogs,
} from "../cache/time-logs.cache";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useDeleteTimeLog(taskId: string) {
    const queryClient = useQueryClient();
    return useApiMutation(
        (timeLogId: string) =>
            taskService.deleteTimeLog(timeLogId),
        {
            showSuccessToast: false,

            onMutate: async (timeLogId) => {
                const syncContext = startBoardSync();
                const optimisticContext =
                    await removeTimeLogFromCacheOptimistically(
                        queryClient,
                        taskId,
                        timeLogId,
                    );

                return { ...syncContext, ...optimisticContext };
            },

            onError: (_, __, context) => {
                rollbackTimeLogs(
                    queryClient,
                    taskId,
                    context?.previousTimeLogs,
                );
            },

            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        }
    )
}
