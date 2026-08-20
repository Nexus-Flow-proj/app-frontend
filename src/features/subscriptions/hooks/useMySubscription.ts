import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/authStore";
import { subscriptionService } from "../services";

export function useMySubscription() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useApiQuery(
    QUERY_KEYS.subscriptions.me(),
    () => subscriptionService.getMySubscription(),
    {
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 2,
    },
  );
}
