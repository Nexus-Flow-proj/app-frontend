import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { ProjectInviteDetails } from "../types";

interface RevokeProjectInviteVariables {
  projectId: string;
  inviteToken: string;
}

export function useRevokeProjectInvite() {
  const queryClient = useQueryClient();

  return useApiMutation<
    ProjectInviteDetails | null,
    RevokeProjectInviteVariables
  >(
    ({ projectId, inviteToken }) =>
      projectService.revokeInvite(projectId, inviteToken),
    {
      successMessage: "Invite revoked.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.invites(variables.projectId),
        });
      },
    },
  );
}
