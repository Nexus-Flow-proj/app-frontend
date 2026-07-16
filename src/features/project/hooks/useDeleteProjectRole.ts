import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";

interface DeleteProjectRoleVariables {
  projectId: string;
  roleId: string;
}

export function useDeleteProjectRole() {
  const queryClient = useQueryClient();

  return useApiMutation<null, DeleteProjectRoleVariables>(
    ({ projectId, roleId }) => projectService.deleteProjectRole(projectId, roleId),
    {
      successMessage: "Project role deleted.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.roles(variables.projectId),
        });
      },
    },
  );
}
