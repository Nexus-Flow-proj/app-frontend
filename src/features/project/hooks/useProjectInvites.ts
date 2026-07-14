import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import type { ApiError, PaginatedResponse } from "@/types";
import { projectService } from "../services";
import type { ProjectInviteListItem, ProjectInvitesQuery } from "../types";

export function useProjectInvites(
  projectId?: string,
  query: ProjectInvitesQuery = {},
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  return useQuery<PaginatedResponse<ProjectInviteListItem>, ApiError>({
    queryKey: [
      ...QUERY_KEYS.projects.invites(projectId ?? ""),
      { page, limit, status: query.status },
    ],
    queryFn: () =>
      projectService.getProjectInvites(projectId ?? "", {
        page,
        limit,
        status: query.status,
      }),
    enabled: !!projectId,
    staleTime: 1000 * 60,
  });
}
