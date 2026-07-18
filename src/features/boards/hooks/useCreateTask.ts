import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiTask, CreateTaskDto } from "../types/api/board-api.types";
import { taskService } from "../services";
import {
    mapTaskSummary,
    normalizeTaskPriority,
    normalizeTaskStatus,
} from "../mappers";
import {
    addOptimisticTaskToColumnStartCache,
    removeOptimisticCreatedTaskFromListCache,
    replaceCreatedTaskInListCache,
} from "../cache/task-list.cache";
import type { Task } from "../types";
import { TaskSource } from "../types/enums";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useCreateTask(projectId: string) {
    const queryClient = useQueryClient();
    return useApiMutation(
        ({
            columnId, dto
        }: {
            columnId: string, dto: CreateTaskDto
        }) =>
            taskService.createTask(projectId, columnId, dto),
        {
            showSuccessToast: false,

            onMutate: async ({ columnId, dto }) => {
                const syncContext = startBoardSync();
                const now = new Date().toISOString();
                const tempTask: Task = {
                    id: `temp-${crypto.randomUUID()}`,
                    projectId,
                    title: dto.title,
                    description: dto.description,
                    dueDate: dto.deadline,
                    tags: dto.label ? [dto.label] : [],
                    status: normalizeTaskStatus(dto.status),
                    priority: normalizeTaskPriority(dto.priority),
                    boardColumnId: columnId,
                    columnOrder: 0,
                    createdBy: "current-user",
                    createdAt: now,
                    updatedAt: now,
                    assignee: null,
                    commentsCount: 0,
                    subtasksCount: 0,
                    completedSubtasksCount: 0,
                    attachmentsCount: 0,
                    source: TaskSource.MANUAL,
                };
                const optimisticContext =
                    await addOptimisticTaskToColumnStartCache(
                        queryClient,
                        projectId,
                        tempTask,
                    );

                return {
                    ...syncContext,
                    ...optimisticContext,
                    tempTaskId: tempTask.id,
                };
            },

            onSuccess: ({ data }: { data: ApiTask }, _, context) => {
                const newTaskSummary = mapTaskSummary(data);
                replaceCreatedTaskInListCache(
                    queryClient,
                    projectId,
                    context?.tempTaskId ?? data.id,
                    newTaskSummary,
                );
            },

            onError: (_, __, context) => {
                if (context?.tempTaskId) {
                    removeOptimisticCreatedTaskFromListCache(
                        queryClient,
                        projectId,
                        context.tempTaskId,
                    );
                }
            },

            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        }
    )
}
