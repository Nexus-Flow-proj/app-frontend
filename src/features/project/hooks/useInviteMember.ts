import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { ProjectInviteDetails, SendProjectInviteDto } from "../types";

interface InviteMemberVariables extends SendProjectInviteDto {
  projectId: string;
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useApiMutation<ProjectInviteDetails, InviteMemberVariables>(
    ({ projectId, ...dto }) => projectService.sendInvite(projectId, dto),
    {
      successMessage: "Invite sent successfully.",
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.invites(variables.projectId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.members(variables.projectId),
        });
      },
    },
  );
}
