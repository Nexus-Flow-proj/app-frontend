import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { projectService } from "../services";

export function useProjectRoles(projectId?: string) {
  return useApiQuery(
    QUERY_KEYS.projects.roles(projectId ?? ""),
    () => projectService.getProjectRoles(projectId ?? ""),
    {
      enabled: !!projectId,
      staleTime: 1000 * 60 * 2,
    },
  );
}
