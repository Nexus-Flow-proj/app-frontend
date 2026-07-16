import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS, ROUTES } from "@/constants";
import { getApiErrorMessages } from "@/lib/api/Messages";
import { markSessionActive } from "@/lib/api/session";
import { useAuthStore } from "@/store";
import type { ApiError } from "@/types";
import { projectService } from "@/features/project/services";
import { authService } from "../services";
import type { LoginDto } from "../types/auth-dto";

interface UseLoginOptions {
  inviteToken?: string;
}

export function useLogin(options: UseLoginOptions = {}) {
  const { inviteToken } = options;
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation((dto: LoginDto) => authService.login(dto), {
    showSuccessToast: false,
    onSuccess: async (res) => {
      const { user } = res.data;
      const displayName = user.firstName + " " + user.lastName;

      markSessionActive();
      setAuth(user);
      queryClient.setQueryData(QUERY_KEYS.auth.me, res);

      if (inviteToken) {
        try {
          const inviteRes = await projectService.acceptInvite(inviteToken);
          const projectId =
            inviteRes.data.project?.id ?? inviteRes.data.projectId;

          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.projects.list(),
          });
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.projects.invitation(inviteToken),
          });

          if (projectId) {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.projects.members(projectId),
            });
            toast.success(`Welcome back, ${displayName}! Invite accepted.`);
            navigate(ROUTES.PROJECT_OVERVIEW(projectId), { replace: true });
            return;
          }

          toast.success(`Welcome back, ${displayName}! Invite accepted.`);
          navigate(ROUTES.DASHBOARD, { replace: true });
          return;
        } catch (inviteError) {
          getApiErrorMessages(inviteError as ApiError).forEach((message) => {
            toast.error(message);
          });
          navigate(`/project/invitation/${inviteToken}`, { replace: true });
          return;
        }
      }

      toast.success(`Welcome back, ${displayName}!`);
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
  });
}
