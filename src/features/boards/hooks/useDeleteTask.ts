import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services";
import {
    removeTaskFromListCache,
    rollbackTaskList,
} from "../cache/task-list.cache";
import { removeTaskDetailCache } from "../cache/task-detail.cache";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useDeleteTask(projectId: string) {
    const queryClient = useQueryClient();
    return useApiMutation(
        (taskId: string) => taskService.deleteTask(taskId),
        {
            showSuccessToast: false,

            onMutate: async (taskId: string) => {
                const syncContext = startBoardSync();
                const optimisticContext = await removeTaskFromListCache(
                    queryClient,
                    projectId,
                    taskId,
                );
                return { ...syncContext, ...optimisticContext };
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
            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        }
    )
}
