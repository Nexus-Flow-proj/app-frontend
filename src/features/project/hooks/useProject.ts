import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { projectService } from "../services";

export function useProject(projectId?: string) {
  return useApiQuery(
    QUERY_KEYS.projects.detail(projectId ?? ""),
    () => projectService.getProject(projectId ?? ""),
    {
      enabled: !!projectId,
      staleTime: 1000 * 60 * 2,
    },
  );
}
