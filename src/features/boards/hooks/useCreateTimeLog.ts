import { useQueryClient } from "@tanstack/react-query";
import type { CreateTimeLogDto } from "../types/api/board-api.types";
import { taskService } from "../services";
import { mapTimeLog } from "../mappers";
import { useApiMutation } from "@/hooks/useApiMutation";
import { addTimeLogToCache } from "../cache/time-logs.cache";
import type { BoardMember } from "../types";

export function useCreateTimeLog(
    taskId: string,
    fallbackUser?: BoardMember,
) {
    const queryClient = useQueryClient();
    return useApiMutation(
        (dto: CreateTimeLogDto) =>
            taskService.createTimeLog(taskId, dto),
        {
            onSuccess: (res) => {
                const newTimeLog = mapTimeLog(
                    res.data,
                    taskId,
                    fallbackUser,
                );
                addTimeLogToCache(queryClient, taskId, newTimeLog);
            }
        }
    )
}
