import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";

import {
    removeCommentFromCache,
    rollbackTaskDetail,
    // invalidateTaskDetail,
} from "../cache/task-detail.cache";

export function useDeleteComment(taskId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (commentId: string) =>
            taskService.deleteComment(commentId),
        {
            onMutate: async (commentId) => {
                return removeCommentFromCache(
                    queryClient,
                    taskId,
                    commentId,
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

            // onSettled: () => {
            //     invalidateTaskDetail(queryClient, taskId);
            // },
        }
    );
}