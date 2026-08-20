import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { CreateKnowledgeInput, KnowledgeDocument } from "../types";

interface CreateProjectKnowledgeVariables extends CreateKnowledgeInput {
  projectId: string;
}

export function useCreateProjectKnowledge() {
  const queryClient = useQueryClient();

  return useApiMutation<KnowledgeDocument, CreateProjectKnowledgeVariables>(
    ({ projectId, ...dto }) => projectService.createKnowledge(projectId, dto),
    {
      successMessage: "Knowledge rule created.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.knowledge(variables.projectId),
        });
      },
    },
  );
}
