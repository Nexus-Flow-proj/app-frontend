import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import { mapComment } from "../mappers/task.mapper";

import type { UpdateCommentDto } from "../types/api/board-api.types";
import {
    rollbackTaskDetail,
    updateCommentInCache,
    updateCommentInCacheOptimistically,
} from "../cache/task-detail.cache";
import type { BoardMember } from "../types";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useUpdateComment(
    taskId: string,
    fallbackAuthor?: BoardMember,
) {
    const queryClient = useQueryClient();

    return useApiMutation(
        ({
            commentId,
            dto,
        }: {
            commentId: string;
            dto: UpdateCommentDto;
        }) => taskService.updateComment(commentId, dto),

        {
            showSuccessToast: false,

            onMutate: async ({ commentId, dto }) => {
                const syncContext = startBoardSync();
                const optimisticContext =
                    await updateCommentInCacheOptimistically(
                        queryClient,
                        taskId,
                        commentId,
                        dto.body,
                    );

                return { ...syncContext, ...optimisticContext };
            },

            onSuccess: (res) => {
                const updated = mapComment(
                    res.data,
                    taskId,
                    fallbackAuthor,
                );
                updateCommentInCache(queryClient, taskId, updated);
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

            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        }
    );
}
