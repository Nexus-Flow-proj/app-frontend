import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import { mapComment } from "../mappers/task.mapper";

import type { CreateCommentDto } from "../types/api/board-api.types";
import {
    addOptimisticCommentToCache,
    rollbackTaskDetail,
    updateCommentInCache,
} from "../cache/task-detail.cache";
import { rollbackTaskListCaches } from "../cache/task-list.cache";
import type { BoardMember, Comment } from "../types";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useCreateComment(
    taskId: string,
    fallbackAuthor?: BoardMember,
) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: CreateCommentDto) =>
            taskService.createComment(taskId, dto),

        {
            showSuccessToast: false,

            onMutate: async (dto) => {
                const syncContext = startBoardSync();
                const now = new Date().toISOString();
                const author =
                    fallbackAuthor ?? {
                        id: "current-user",
                        name: "Current user",
                    };
                const tempComment: Comment = {
                    id: `temp-${crypto.randomUUID()}`,
                    taskId,
                    authorId: author.id,
                    author,
                    content: dto.body,
                    createdAt: now,
                    updatedAt: now,
                };
                const optimisticContext = await addOptimisticCommentToCache(
                    queryClient,
                    taskId,
                    tempComment,
                );

                return {
                    ...syncContext,
                    ...optimisticContext,
                    tempCommentId: tempComment.id,
                };
            },

            onSuccess: (res, _, context) => {
                const newComment = mapComment(
                    res.data,
                    taskId,
                    fallbackAuthor,
                );
                updateCommentInCache(
                    queryClient,
                    taskId,
                    newComment,
                    context?.tempCommentId,
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
                rollbackTaskListCaches(queryClient, context?.previousTaskLists);
            },

            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        }
    );
}
