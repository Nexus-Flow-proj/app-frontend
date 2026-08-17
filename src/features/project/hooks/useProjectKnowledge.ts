import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { projectService } from "../services";
import type { KnowledgeSourceType } from "../types";

export function useProjectKnowledge(
  projectId?: string,
  sourceType?: KnowledgeSourceType,
) {
  return useApiQuery(
    QUERY_KEYS.projects.knowledge(projectId ?? "", sourceType),
    () => projectService.getKnowledge(projectId ?? "", { sourceType }),
    {
      enabled: !!projectId,
      staleTime: 1000 * 60 * 2,
    },
  );
}
