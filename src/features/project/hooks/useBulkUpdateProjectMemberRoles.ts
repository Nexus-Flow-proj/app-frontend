import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type {
  BulkUpdateProjectMemberRolesDto,
  ProjectMemberSummary,
} from "../types";

interface BulkUpdateProjectMemberRolesVariables
  extends BulkUpdateProjectMemberRolesDto {
  projectId: string;
}

export function useBulkUpdateProjectMemberRoles() {
  const queryClient = useQueryClient();

  return useApiMutation<
    ProjectMemberSummary[],
    BulkUpdateProjectMemberRolesVariables
  >(
    ({ projectId, ...dto }) =>
      projectService.bulkUpdateMemberRoles(projectId, dto),
    {
      successMessage: "Member roles updated.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.members(variables.projectId),
        });
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
