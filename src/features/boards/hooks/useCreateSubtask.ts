import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import { mapSubtask } from "../mappers";

import type { CreateSubtaskDto } from "../types/api/board-api.types";
import {
    addOptimisticSubtaskToCache,
    rollbackTaskDetail,
    updateSubtaskInCache,
} from "../cache/task-detail.cache";
import type { Subtask } from "../types";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useCreateSubtask(taskId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: CreateSubtaskDto) =>
            taskService.createSubtask(taskId, dto),
        {
            showSuccessToast: false,

            onMutate: async (dto) => {
                const syncContext = startBoardSync();
                const now = new Date().toISOString();
                const tempSubtask: Subtask = {
                    id: `temp-${crypto.randomUUID()}`,
                    taskId,
                    title: dto.title,
                    completed: false,
                    position: 0,
                    createdAt: now,
                    updatedAt: now,
                };
                const optimisticContext = await addOptimisticSubtaskToCache(
                    queryClient,
                    taskId,
                    tempSubtask,
                );

                return {
                    ...syncContext,
                    ...optimisticContext,
                    tempSubtaskId: tempSubtask.id,
                };
            },

            onSuccess: (res, _, context) => {
                const newSubtask = mapSubtask(res.data, taskId);
                updateSubtaskInCache(
                    queryClient,
                    taskId,
                    newSubtask,
                    context?.tempSubtaskId,
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

            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        },
    );
}
