import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { ProjectInviteDetails } from "../types";

interface CancelProjectInviteVariables {
  projectId: string;
  inviteToken: string;
}

export function useCancelProjectInvite() {
  const queryClient = useQueryClient();

  return useApiMutation<ProjectInviteDetails, CancelProjectInviteVariables>(
    ({ projectId, inviteToken }) =>
      projectService.cancelInvite(projectId, inviteToken),
    {
      successMessage: "Invite cancelled.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.invites(variables.projectId),
        });
      },
    },
  );
}
