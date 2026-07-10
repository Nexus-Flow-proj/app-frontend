import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants";
import { markSessionActive } from "@/lib/api/session";
import { useAuthStore } from "@/store";
import { authService } from "../services";
import type { AuthResponseData } from "../types/auth-response";

export function useInviteAccept() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation<AuthResponseData, string>(
    (token) => authService.acceptInvite(token),
    {
      showSuccessToast: false,
      onSuccess: (res) => {
        const { user } = res.data;
        markSessionActive();
        setAuth(user);
        queryClient.setQueryData(QUERY_KEYS.auth.me, res);
        toast.success("Invite accepted! Welcome to the project.");
        navigate("/dashboard", { replace: true });
      },
    },
  );
}
