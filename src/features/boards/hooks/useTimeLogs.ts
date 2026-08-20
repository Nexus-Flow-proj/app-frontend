import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";
import { taskService } from "../services";
import { mapTimeLog } from "../mappers";

export function useTimeLogs(taskId: string) {
    return useQuery({
        queryKey: QUERY_KEYS.tasks.timeLogs(taskId),

        queryFn: async () => {
            const res = await taskService.getTimeLogs(taskId);
            return {
                ...res.data,
                timeLogs: res.data.timeLogs.map(log =>
                    mapTimeLog(log, taskId)
                ),
            };
        },
        enabled: !!taskId,
        staleTime: 1000 * 30,
    });
}