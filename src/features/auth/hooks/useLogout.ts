import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useAuthStore } from "@/store";
import { authService } from "../services";

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation<null, void>(
    () => authService.logout(),
    {
      showSuccessToast: false,
      showErrorToast: false,
      onSettled: () => {
        logout();
        queryClient.clear();
        navigate("/login", { replace: true });
      },
    },
  );
}
