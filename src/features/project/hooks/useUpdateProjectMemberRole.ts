import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { ProjectMemberSummary, UpdateProjectMemberRoleDto } from "../types";

interface UpdateProjectMemberRoleVariables
  extends UpdateProjectMemberRoleDto {
  projectId: string;
  memberId: string;
}

export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient();

  return useApiMutation<
    ProjectMemberSummary,
    UpdateProjectMemberRoleVariables
  >(
    ({ projectId, memberId, ...dto }) =>
      projectService.updateMemberRole(projectId, memberId, dto),
    {
      successMessage: "Member role updated.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.members(variables.projectId),
        });
      },
    },
  );
}
