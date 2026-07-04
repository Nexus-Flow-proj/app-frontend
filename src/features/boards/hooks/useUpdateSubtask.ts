import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import { mapSubtask } from "../mappers";

import type { UpdateSubtaskDto } from "../types/api/board-api.types";
import { updateSubtaskInCache } from "../cache/task-detail.cache";

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
        },
    );
}