import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { Project } from "@/types";
import { projectService } from "../services";
import type { UpdateProjectDto } from "../types";

interface UpdateProjectVariables extends UpdateProjectDto {
  projectId: string;
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useApiMutation<Project, UpdateProjectVariables>(
    ({ projectId, ...dto }) => projectService.updateProject(projectId, dto),
    {
      successMessage: "Project details updated.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.detail(variables.projectId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.list(),
        });
      },
    },
  );
}
