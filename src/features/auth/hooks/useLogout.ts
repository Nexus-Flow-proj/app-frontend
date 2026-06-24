import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useAuthStore } from "@/store";
import { authService } from "../services";

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useApiMutation<null, void>(() => authService.logout(), {
    showSuccessToast: false,
    showErrorToast: true,
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}
