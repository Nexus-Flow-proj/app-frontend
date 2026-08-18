import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useAuthStore } from "@/store/authStore";
import { profileService } from "../services";

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useApiMutation<null, void>(
    () => profileService.deleteAvatar(),
    {
      successMessage: "Avatar removed successfully.",
      onSuccess: () => {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({
            ...currentUser,
            avatarUrl: undefined,
          });
        }

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.profile.me(),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.auth.me,
        });
      },
    },
  );
}
