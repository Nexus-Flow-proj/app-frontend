import { QUERY_KEYS } from "@/constants";
import { projectService } from "../services";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ProjectActivityListResponse } from "../types";

const DEFAULT_LIMIT = 50;

export function useInfiniteProjectActivity(projectId: string, limit: number = DEFAULT_LIMIT) {
    return useInfiniteQuery<
        ProjectActivityListResponse,
        Error,
        ProjectActivityListResponse,
        ReturnType<typeof QUERY_KEYS.projects.activity>,
        number
    >({
        queryKey: QUERY_KEYS.projects.activity(projectId),
        queryFn: async ({ pageParam }) => {
            const res = await projectService.getProjectActivity(projectId, pageParam, limit);
            return res.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage;
            return page < totalPages ? page + 1 : undefined;
        },
        select: (data) => {
            // Flatten all pages into a single list + carry forward
            const existedActivityIds = new Set<string>();
            const firstPage = data.pages[0];
            const latestPage = data.pages[data.pages.length - 1];

            const allActivities = data.pages.flatMap(
                (page) => page.activities,
            ).filter(activity => {
                if (existedActivityIds.has(activity.id))
                    return false;
                existedActivityIds.add(activity.id);
                return true;
            });

            return {
                activities: allActivities,
                page: latestPage.page,
                limit: firstPage.limit,
                total: firstPage.total,
                totalPages: firstPage.totalPages,
            };
        },
        refetchInterval: 60_000,
        enabled: !!projectId,
    });
}
