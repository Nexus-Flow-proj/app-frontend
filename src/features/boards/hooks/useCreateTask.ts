import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiTask, CreateTaskDto } from "../types/api/board-api.types";
import { taskService } from "../services";
import { mapTaskSummary } from "../mappers";
import { addTaskToListCache } from "../cache/task-list.cache";

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
            // Typescript won't complain because the apiTask has all the data of the ApiTaskSummary plus other data 
            // , think in it as the animal and the dog 
            onSuccess: ({ data }: { data: ApiTask }) => {
                const newTaskSummary = mapTaskSummary(data);
                addTaskToListCache(queryClient, projectId, newTaskSummary);
            }
        }
    )
}