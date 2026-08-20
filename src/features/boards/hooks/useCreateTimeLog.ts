import { useQueryClient } from "@tanstack/react-query";
import type { CreateTimeLogDto } from "../types/api/board-api.types";
import { taskService } from "../services";
import { mapTimeLog } from "../mappers";
import { useApiMutation } from "@/hooks/useApiMutation";
import {
    addOptimisticTimeLogToCache,
    replaceTimeLogInCache,
    rollbackTimeLogs,
} from "../cache/time-logs.cache";
import type { BoardMember, TimeLog } from "../types";
import { finishBoardSync, startBoardSync } from "../utils/board-sync";

export function useCreateTimeLog(
    taskId: string,
    fallbackUser?: BoardMember,
) {
    const queryClient = useQueryClient();
    return useApiMutation(
        (dto: CreateTimeLogDto) =>
            taskService.createTimeLog(taskId, dto),
        {
            showSuccessToast: false,

            onMutate: async (dto) => {
                const syncContext = startBoardSync();
                const now = new Date().toISOString();
                const user =
                    fallbackUser ?? {
                        id: "current-user",
                        name: "Current user",
                    };
                const tempTimeLog: TimeLog = {
                    id: `temp-${crypto.randomUUID()}`,
                    taskId,
                    userId: user.id,
                    user,
                    minutes: dto.durationMin,
                    description: dto.note,
                    loggedAt: dto.loggedDate,
                    createdAt: now,
                };
                const optimisticContext = await addOptimisticTimeLogToCache(
                    queryClient,
                    taskId,
                    tempTimeLog,
                );

                return {
                    ...syncContext,
                    ...optimisticContext,
                    tempTimeLogId: tempTimeLog.id,
                };
            },

            onSuccess: (res, _, context) => {
                const newTimeLog = mapTimeLog(
                    res.data,
                    taskId,
                    fallbackUser,
                );
                replaceTimeLogInCache(
                    queryClient,
                    taskId,
                    context?.tempTimeLogId ?? newTimeLog.id,
                    newTimeLog,
                );
            },

            onError: (_, __, context) => {
                rollbackTimeLogs(
                    queryClient,
                    taskId,
                    context?.previousTimeLogs,
                );
            },

            onSettled: (_, error, __, context) => {
                finishBoardSync(context, !error);
            },
        }
    )
}
