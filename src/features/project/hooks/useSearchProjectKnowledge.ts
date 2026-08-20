import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { KnowledgeSearchInput, KnowledgeSearchResult } from "../types";

interface SearchProjectKnowledgeVariables extends KnowledgeSearchInput {
  projectId: string;
}

export function useSearchProjectKnowledge() {
  return useApiMutation<KnowledgeSearchResult[], SearchProjectKnowledgeVariables>(
    ({ projectId, ...dto }) => projectService.searchKnowledge(projectId, dto),
    {
      showSuccessToast: false,
    },
  );
}
