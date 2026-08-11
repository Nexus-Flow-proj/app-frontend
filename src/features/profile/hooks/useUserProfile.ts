import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants";
import { profileService } from "../services";
import type { PublicUserProfile } from "../types";

export function useUserProfile(userId: string | undefined) {
  const query = useApiQuery<PublicUserProfile>(
    QUERY_KEYS.profile.user(userId ?? ""),
    () => profileService.getUserProfile(userId ?? ""),
    {
      enabled: !!userId,
      staleTime: 1000 * 60 * 5,
    },
  );

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
