import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services";
import {
    removeTaskFromListCache,
    rollbackTaskList,
} from "../cache/task-list.cache";
import { removeTaskDetailCache } from "../cache/task-detail.cache";

export function useDeleteTask(projectId: string) {
    const queryClient = useQueryClient();
    return useApiMutation(
        (taskId: string) => taskService.deleteTask(taskId),
        {
            onMutate: async (taskId: string) => {
                return removeTaskFromListCache(
                    queryClient,
                    projectId,
                    taskId,
                );
            },
            onSuccess: (_, taskId) => {
                removeTaskDetailCache(queryClient, taskId);
            },
            onError: (_, __, context) => {
                if (context?.previousTaskList) {
                    rollbackTaskList(
                        queryClient,
                        projectId,
                        context.previousTaskList,
                    );
                }
            },
        }
    )
}
