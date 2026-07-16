import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { QUERY_KEYS, ROUTES } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { ProjectInviteDetails } from "../types";

export function useDeclineProjectInvitation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation<ProjectInviteDetails, string>(
    (inviteToken) => projectService.declineInvite(inviteToken),
    {
      successMessage: "Invitation declined.",
      onSuccess: (_res, inviteToken) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.invitation(inviteToken),
        });
        navigate(ROUTES.DASHBOARD, { replace: true });
      },
    },
  );
}
