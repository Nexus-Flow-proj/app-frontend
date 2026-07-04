import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";

import { taskService } from "../services";
import { mapSubtask } from "../mappers";

import type { CreateSubtaskDto } from "../types/api/board-api.types";
import { addSubtaskToCache } from "../cache/task-detail.cache";

export function useCreateSubtask(taskId: string) {
    const queryClient = useQueryClient();

    return useApiMutation(
        (dto: CreateSubtaskDto) =>
            taskService.createSubtask(taskId, dto),
        {
            onSuccess: (res) => {
                const newSubtask = mapSubtask(res.data, taskId);
                addSubtaskToCache(queryClient, taskId, newSubtask);
            },
        },
    );
}