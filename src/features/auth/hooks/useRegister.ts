import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { QUERY_KEYS } from "@/constants";
import { setCsrfToken } from "@/lib/api/csrf";
import { markSessionActive } from "@/lib/api/session";
import { useAuthStore } from "@/store";
import { authService } from "../services";
import type { AuthResponseData } from "../types/auth-response";
import type { RegisterDto } from "../types/auth-dto";

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation<AuthResponseData, RegisterDto>(
    (dto) => authService.register(dto),
    {
      showSuccessToast: false,
      onSuccess: (res) => {
        const { user, csrfToken } = res.data;
        markSessionActive();
        setCsrfToken(csrfToken);
        setAuth(user);
        queryClient.setQueryData(QUERY_KEYS.auth.me, res);
        toast.success("Account created! Welcome to Nexus-Flow.");
        navigate("/dashboard", { replace: true });
      },
    },
  );
}
