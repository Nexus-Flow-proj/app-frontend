import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import { mapComment } from "../mappers/task.mapper";

import type { CreateCommentDto } from "../types/api/board-api.types";
import { addCommentToCache } from "../cache/task-detail.cache";

export function useCreateComment(taskId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: CreateCommentDto) =>
            taskService.createComment(taskId, dto),

        {
            onSuccess: (res) => {
                const newComment = mapComment(res.data, taskId);
                addCommentToCache(queryClient, taskId, newComment);
            },
        }
    );
}