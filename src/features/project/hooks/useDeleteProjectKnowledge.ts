import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";

interface DeleteProjectKnowledgeVariables {
  projectId: string;
  chunkId: string;
}

export function useDeleteProjectKnowledge() {
  const queryClient = useQueryClient();

  return useApiMutation<{ deleted: true }, DeleteProjectKnowledgeVariables>(
    ({ projectId, chunkId }) =>
      projectService.deleteKnowledge(projectId, chunkId),
    {
      successMessage: "Knowledge rule deleted.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.knowledge(variables.projectId),
        });
      },
    },
  );
}
