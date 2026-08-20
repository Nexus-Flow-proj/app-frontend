import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

import { taskService } from "../services";

import { mapTaskSummary } from "../mappers";


export function useProjectTasks(projectId: string) {
    return useQuery({
        queryKey: QUERY_KEYS.tasks.list(projectId),
        queryFn: async () => {
            const res = await taskService.getProjectTasks(projectId);
            return {
                ...res.data,
                tasks: res.data.tasks.map(task => mapTaskSummary(task))
            };
        },
        enabled: !!projectId,
    });
}