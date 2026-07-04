import { useQuery } from "@tanstack/react-query";
import { taskService } from "../services/index";
import { QUERY_KEYS } from "@/constants";
import { mapTaskDetail } from "../mappers";
export function useTask(taskId: string) {
    return useQuery({
        queryKey: QUERY_KEYS.tasks.detail(taskId),
        queryFn: async () => {
            const res = await taskService.getTask(taskId);
            return mapTaskDetail(res.data);
        },
        enabled: !!taskId,
    })
}