import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { projectService } from "../services";

export function useProjectMembers(projectId?: string) {
  return useApiQuery(
    QUERY_KEYS.projects.members(projectId ?? ""),
    () => projectService.getProjectMembers(projectId ?? ""),
    {
      enabled: !!projectId,
      staleTime: 1000 * 60 * 2,
    },
  );
}
