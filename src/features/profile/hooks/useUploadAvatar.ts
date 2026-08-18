import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useAuthStore } from "@/store/authStore";
import { profileService } from "../services";
import type { AvatarUploadResponse } from "../types";

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useApiMutation<AvatarUploadResponse, File>(
    (file) => profileService.uploadAvatar(file),
    {
      successMessage: "Avatar updated successfully.",
      onSuccess: (res) => {
        const newAvatarUrl = res.data?.avatarUrl;
        const currentUser = useAuthStore.getState().user;
        if (currentUser && newAvatarUrl) {
          useAuthStore.getState().setUser({
            ...currentUser,
            avatarUrl: newAvatarUrl,
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
