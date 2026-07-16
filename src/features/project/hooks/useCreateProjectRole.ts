import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { CreateProjectRoleDto, ProjectRoleDefinition } from "../types";

interface CreateProjectRoleVariables extends CreateProjectRoleDto {
  projectId: string;
}

export function useCreateProjectRole() {
  const queryClient = useQueryClient();

  return useApiMutation<ProjectRoleDefinition, CreateProjectRoleVariables>(
    ({ projectId, ...dto }) => projectService.createProjectRole(projectId, dto),
    {
      successMessage: "Project role created.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.roles(variables.projectId),
        });
      },
    },
  );
}
