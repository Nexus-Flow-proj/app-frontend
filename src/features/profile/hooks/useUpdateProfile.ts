import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { profileService } from "../services";
import type { UpdateProfileDto, UserProfile } from "../types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useApiMutation<UserProfile, UpdateProfileDto>(
    (dto) => profileService.updateMyProfile(dto),
    {
      successMessage: "Profile updated successfully.",
      onSuccess: () => {
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
