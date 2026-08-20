import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/authStore";
import { subscriptionService } from "../services";

export function usePaymentHistory() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useApiQuery(
    QUERY_KEYS.subscriptions.payments(),
    () => subscriptionService.getPaymentHistory(),
    {
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 5,
    },
  );
}
