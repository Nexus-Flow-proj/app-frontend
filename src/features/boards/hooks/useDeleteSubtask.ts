import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";

import {
    removeSubtaskFromCache,
    rollbackTaskDetail,
    invalidateTaskDetail,
} from "../cache/task-detail.cache";

export function useDeleteSubtask(taskId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (subtaskId: string) =>
            taskService.deleteSubtask(taskId, subtaskId),

        {
            onMutate: async (subtaskId) => {
                return removeSubtaskFromCache(
                    queryClient,
                    taskId,
                    subtaskId,
                );
            },

            onError: (_, __, context) => {
                if (context?.previousTask) {
                    rollbackTaskDetail(
                        queryClient,
                        taskId,
                        context.previousTask,
                    );
                }
            },

            onSettled: () => {
                invalidateTaskDetail(queryClient, taskId);
            },
        },
    );
}