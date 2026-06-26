import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { projectService } from "../services";

export function useProjects() {
  return useApiQuery(
    QUERY_KEYS.projects.list(),
    () => projectService.getProjects(),
    {
      staleTime: 1000 * 60 * 2,
    },
  );
}
