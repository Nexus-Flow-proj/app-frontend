import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { QUERY_KEYS, ROUTES } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { projectService } from "../services";
import type { ProjectInviteDetails } from "../types";

export function useAcceptProjectInvitation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation<ProjectInviteDetails, string>(
    (inviteToken) => projectService.acceptInvite(inviteToken),
    {
      successMessage: "Invite accepted. Welcome to the project.",
      onSuccess: (res) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.list(),
        });

        const projectId = res.data.project?.id ?? res.data.projectId;

        if (projectId) {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.projects.members(projectId),
          });
          navigate(ROUTES.PROJECT_OVERVIEW(projectId), { replace: true });
          return;
        }

        navigate(ROUTES.DASHBOARD, { replace: true });
      },
    },
  );
}
