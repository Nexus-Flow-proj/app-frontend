import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants";
import { markSessionActive } from "@/lib/api/session";
import { useAuthStore } from "@/store";
import { authService } from "../services";
import type { LoginDto } from "../types/auth-dto";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation((dto: LoginDto) => authService.login(dto), {
    showSuccessToast: false,
    onSuccess: (res) => {
      const { user } = res.data;
      const displayName = user.firstName + " " + user.lastName;

      markSessionActive();
      setAuth(user);
      queryClient.setQueryData(QUERY_KEYS.auth.me, res);
      toast.success(`Welcome back, ${displayName}!`);
      navigate("/dashboard", { replace: true });
    },
  });
}
