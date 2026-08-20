import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { projectService } from "../services";

export function useProjectSummary(projectId?: string) {
  return useApiQuery(
    QUERY_KEYS.projects.summary(projectId ?? ""),
    () => projectService.getProjectSummary(projectId ?? ""),
    {
      enabled: false,
      staleTime: 1000 * 60 * 5,
    },
  );
}
