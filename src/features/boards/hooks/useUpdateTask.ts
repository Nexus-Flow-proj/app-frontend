import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { taskService } from "../services";
import type { TaskUpdatedData, UpdateTaskDto } from "../types/api/board-api.types";

import type {
    Task,
    TaskDetail,
} from "../types";

import {
    updateTaskInListCache,
    rollbackTaskList,
    invalidateTaskList,
} from "../cache/task-list.cache";
import {
    snapshotTaskDetail,
    updateTaskDetailCache,
    rollbackTaskDetail,
    invalidateTaskDetail,
} from "../cache/task-detail.cache";
import { mapBoardMember } from "../mappers";

type TaskUpdatePatch = UpdateTaskDto & Partial<TaskUpdatedData>;

export function useUpdateTask(
    projectId: string,
    taskId: string,
) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: UpdateTaskDto) =>
            taskService.updateTask(taskId, dto),

        {
            onMutate: async (dto) => {
                const previousTaskDetail = await snapshotTaskDetail(
                    queryClient,
                    taskId,
                );

                const { previousTaskList } =
                    await updateTaskInListCache(
                        queryClient,
                        projectId,
                        taskId,
                        (task) => updateTaskList(task, dto),
                    );

                // Update task drawer
                updateTaskDetailCache(
                    queryClient,
                    taskId,
                    (old) => updateTaskDetail(old, dto),
                );

                return {
                    previousTaskList,
                    previousTaskDetail,
                };
            },
            onSuccess: () => {
                invalidateTaskList(queryClient, projectId);
                invalidateTaskDetail(queryClient, taskId);
            },

            onError: (_, __, context) => {
                if (context?.previousTaskList) {
                    rollbackTaskList(
                        queryClient,
                        projectId,
                        context.previousTaskList,
                    );
                }

                if (context?.previousTaskDetail) {
                    rollbackTaskDetail(
                        queryClient,
                        taskId,
                        context.previousTaskDetail,
                    );
                }
            },
        },
    );
}

interface UpdateTaskByIdVariables {
    taskId: string;
    dto: UpdateTaskDto;
}

export function useUpdateTaskById(projectId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        ({ taskId, dto }: UpdateTaskByIdVariables) =>
            taskService.updateTask(taskId, dto),

        {
            showSuccessToast: false,

            onMutate: async ({ taskId, dto }) => {
                const previousTaskDetail = await snapshotTaskDetail(
                    queryClient,
                    taskId,
                );

                const { previousTaskList } =
                    await updateTaskInListCache(
                        queryClient,
                        projectId,
                        taskId,
                        (task) => updateTaskList(task, dto),
                    );

                updateTaskDetailCache(
                    queryClient,
                    taskId,
                    (old) => updateTaskDetail(old, dto),
                );

                return {
                    previousTaskList,
                    previousTaskDetail,
                };
            },

            onSuccess: (_, { taskId }) => {
                invalidateTaskList(queryClient, projectId);
                invalidateTaskDetail(queryClient, taskId);
            },

            onError: (_, { taskId }, context) => {
                if (context?.previousTaskList) {
                    rollbackTaskList(
                        queryClient,
                        projectId,
                        context.previousTaskList,
                    );
                }

                if (context?.previousTaskDetail) {
                    rollbackTaskDetail(
                        queryClient,
                        taskId,
                        context.previousTaskDetail,
                    );
                }
            },
        },
    );
}
// Keep this helper synchronized with UpdateTaskDto.
// export function updateTask<T extends Task | TaskDetail>(
//     task: T,
//     dto: TaskUpdatedData,
// ): T {
//     const updatedTask = {
//         ...task,

//         title: dto.title ?? task.title,

//         description:
//             dto.description ?? task.description,

//         priority:
//             dto.priority ?? task.priority,

//         dueDate:
//             dto.deadline ?? task.dueDate,

//         boardColumnId:
//             dto.boardColumn?.id ?? task.boardColumnId,
//         columnOrder: dto.columnOrder ?? task.columnOrder,
//         updatedAt: dto.updated_at ?? task.updatedAt,
//         status: dto.status ?? task.status,
//         attachmentsCount: task.attachmentsCount,
//         commentsCount: task.commentsCount,
//         subtasksCount: task.subtasksCount,
//         completedSubtasksCount: task.completedSubtasksCount,
//         source: dto.source ?? task.source,
//         assignee: mapBoardMember(dto.assignee) ?? task.assignee,

//     };
//     if ("attachments" in task) {
//         updatedTask.attachments = 
//             dto.attachments ?? task.attachments;
//     }
//     return
// }
export function updateTaskDetail(
    task: TaskDetail,
    dto: TaskUpdatePatch,
): TaskDetail {
    return {
        ...task,

        title: dto.title ?? task.title,

        description:
            dto.description ?? task.description,

        priority:
            dto.priority ?? task.priority,

        dueDate:
            dto.deadline ?? task.dueDate,

        boardColumnId:
            dto.boardColumn?.id ?? dto.boardColumnId ?? task.boardColumnId,
        columnOrder: dto.columnOrder ?? task.columnOrder,
        updatedAt: dto.updated_at ?? task.updatedAt,
        status: dto.status ?? task.status,
        attachmentsCount: task.attachmentsCount,
        source: dto.source ?? task.source,
        assignee: dto.assignee ? mapBoardMember(dto.assignee) : task.assignee,
        tags:
            dto.label !== undefined
                ? dto.label ? [dto.label] : []
                : task.tags,
        attachments: dto.attachments ?? task.attachments,
    };


}

// Keep this helper synchronized with UpdateTaskDto.
export function updateTaskList(
    task: Task,
    dto: TaskUpdatePatch,
): Task {
    return {
        ...task,
        title: dto.title ?? task.title,
        description:
            dto.description ?? task.description,
        priority:
            dto.priority ?? task.priority,
        dueDate:
            dto.deadline ?? task.dueDate,
        boardColumnId:
            dto.boardColumn?.id ?? dto.boardColumnId ?? task.boardColumnId,
        columnOrder: dto.columnOrder ?? task.columnOrder,
        updatedAt: dto.updated_at ?? task.updatedAt,
        status: dto.status ?? task.status,
        attachmentsCount: task.attachmentsCount,
        source: dto.source ?? task.source,
        assignee: dto.assignee ? mapBoardMember(dto.assignee) : task.assignee,
        tags:
            dto.label !== undefined
                ? dto.label ? [dto.label] : []
                : task.tags,

    };
}
