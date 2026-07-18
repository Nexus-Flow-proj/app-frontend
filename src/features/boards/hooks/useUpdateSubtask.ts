import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import { mapSubtask } from "../mappers";

import type { UpdateSubtaskDto } from "../types/api/board-api.types";
import {
    rollbackTaskDetail,
    updateSubtaskInCache,
    updateSubtaskInCacheOptimistically,
} from "../cache/task-detail.cache";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useUpdateSubtask(taskId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        ({
            subtaskId,
            dto,
        }: {
            subtaskId: string;
            dto: UpdateSubtaskDto;
        }) =>
            taskService.updateSubtask(taskId, subtaskId, dto),

        {
            showSuccessToast: false,

            onMutate: async ({ subtaskId, dto }) => {
                const syncContext = startBoardSync();
                const optimisticContext =
                    await updateSubtaskInCacheOptimistically(
                        queryClient,
                        taskId,
                        subtaskId,
                        {
                            title: dto.title,
                            completed: dto.completed,
                        },
                    );

                return { ...syncContext, ...optimisticContext };
            },

            onSuccess: (res) => {
                const updatedSubtask = mapSubtask(
                    res.data,
                    taskId,
                );
                updateSubtaskInCache(
                    queryClient,
                    taskId,
                    updatedSubtask,
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
