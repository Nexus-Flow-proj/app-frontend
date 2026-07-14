import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import { mapComment } from "../mappers/task.mapper";

import type { UpdateCommentDto } from "../types/api/board-api.types";
import { updateCommentInCache } from "../cache/task-detail.cache";
import type { BoardMember } from "../types";

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
            onSuccess: (res) => {
                const updated = mapComment(
                    res.data,
                    taskId,
                    fallbackAuthor,
                );
                updateCommentInCache(queryClient, taskId, updated);
            },
        }
    );
}
