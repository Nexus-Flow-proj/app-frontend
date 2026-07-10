import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useApiMutation } from "@/hooks/useApiMutation";
import { clearSessionCache } from "@/lib/api/session";
import { useAuthStore } from "@/store";
import { authService } from "../services";

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useApiMutation<null, void>(() => authService.logout(), {
    showSuccessToast: false,
    showErrorToast: false,
    onSettled: async () => {
      logout();
      await clearSessionCache(queryClient);
      navigate("/login", { replace: true });
    },
  });
}
