import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { ProjectRoleDefinition, UpdateProjectRoleDto } from "../types";

interface UpdateProjectRoleVariables extends UpdateProjectRoleDto {
  projectId: string;
  roleId: string;
}

export function useUpdateProjectRole() {
  const queryClient = useQueryClient();

  return useApiMutation<ProjectRoleDefinition, UpdateProjectRoleVariables>(
    ({ projectId, roleId, ...dto }) =>
      projectService.updateProjectRole(projectId, roleId, dto),
    {
      successMessage: "Project role updated.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.roles(variables.projectId),
        });
      },
    },
  );
}
