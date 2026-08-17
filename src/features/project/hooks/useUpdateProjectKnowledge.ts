import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { KnowledgeDocument, UpdateKnowledgeInput } from "../types";

interface UpdateProjectKnowledgeVariables extends UpdateKnowledgeInput {
  projectId: string;
  chunkId: string;
}

export function useUpdateProjectKnowledge() {
  const queryClient = useQueryClient();

  return useApiMutation<KnowledgeDocument, UpdateProjectKnowledgeVariables>(
    ({ projectId, chunkId, ...dto }) =>
      projectService.updateKnowledge(projectId, chunkId, dto),
    {
      successMessage: "Knowledge rule updated.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.knowledge(variables.projectId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.knowledgeDetail(
            variables.projectId,
            variables.chunkId,
          ),
        });
      },
    },
  );
}
