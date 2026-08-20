import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";

import {
    removeCommentFromCache,
    rollbackTaskDetail,
    // invalidateTaskDetail,
} from "../cache/task-detail.cache";
import { rollbackTaskListCaches } from "../cache/task-list.cache";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useDeleteComment(taskId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (commentId: string) =>
            taskService.deleteComment(commentId),
        {
            showSuccessToast: false,

            onMutate: async (commentId) => {
                const syncContext = startBoardSync();
                const optimisticContext = await removeCommentFromCache(
                    queryClient,
                    taskId,
                    commentId,
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

            // onSettled: () => {
            //     invalidateTaskDetail(queryClient, taskId);
            // },
            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        }
    );
}
