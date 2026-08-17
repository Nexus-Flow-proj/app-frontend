import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";

import {
    removeSubtaskFromCache,
    rollbackTaskDetail,
    invalidateTaskDetail,
} from "../cache/task-detail.cache";
import { rollbackTaskListCaches } from "../cache/task-list.cache";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useDeleteSubtask(taskId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (subtaskId: string) =>
            taskService.deleteSubtask(taskId, subtaskId),

        {
            showSuccessToast: false,

            onMutate: async (subtaskId) => {
                const syncContext = startBoardSync();
                const optimisticContext = await removeSubtaskFromCache(
                    queryClient,
                    taskId,
                    subtaskId,
                );
                return { ...syncContext, ...optimisticContext };
            },

            onError: (_, __, context) => {
                if (context?.previousTask) {
                    rollbackTaskDetail(
                        queryClient,
                        taskId,
                        context.previousTask,
                    );
                }
                rollbackTaskListCaches(queryClient, context?.previousTaskLists);
            },

            onSettled: (_, error, __, context) => {
                invalidateTaskDetail(queryClient, taskId);
                finishBoardSync(context, !error);
            },
        },
    );
}
