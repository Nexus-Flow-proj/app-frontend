import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import { mapSubtask } from "../mappers";

import type { CreateSubtasksDto } from "../types/api/board-api.types";
import {
    addOptimisticSubtasksToCache,
    rollbackTaskDetail,
    updateSubtaskInCache,
} from "../cache/task-detail.cache";
import { rollbackTaskListCaches } from "../cache/task-list.cache";
import type { Subtask } from "../types";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useCreateSubtask(taskId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: CreateSubtasksDto) =>
            taskService.createSubtask(taskId, dto),
        {
            showSuccessToast: false,

            onMutate: async (dto) => {
                const syncContext = startBoardSync();
                const now = new Date().toISOString();
                const tempSubtasks: Subtask[] = dto.subtasks.map((subtask) => ({
                    id: `temp-${crypto.randomUUID()}`,
                    taskId,
                    title: subtask.title,
                    completed: false,
                    position: subtask.sortOrder,
                    createdAt: now,
                    updatedAt: now,
                }));
                const optimisticContext = await addOptimisticSubtasksToCache(
                    queryClient,
                    taskId,
                    tempSubtasks,
                );

                return {
                    ...syncContext,
                    ...optimisticContext,
                    tempSubtaskIds: tempSubtasks.map((subtask) => subtask.id),
                };
            },

            onSuccess: (res, _, context) => {
                res.data.forEach((apiSubtask, index) => {
                    const newSubtask = mapSubtask(apiSubtask, taskId);
                    updateSubtaskInCache(
                        queryClient,
                        taskId,
                        newSubtask,
                        context?.tempSubtaskIds?.[index],
                    );
                });
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
        },
    );
}
