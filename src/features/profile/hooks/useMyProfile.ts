import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants";
import { profileService } from "../services";
import type { UserProfile } from "../types";

export const MY_PROFILE_QUERY_KEY = QUERY_KEYS.profile.me();

export function useMyProfile() {
  const query = useApiQuery<UserProfile>(
    MY_PROFILE_QUERY_KEY,
    () => profileService.getMyProfile(),
    { staleTime: 1000 * 60 * 2 },
  );

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
