import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { subscriptionService } from "../services";

export function usePlans() {
  return useApiQuery(
    QUERY_KEYS.subscriptions.plans(),
    () => subscriptionService.getPlans(),
    {
      staleTime: 1000 * 60 * 10,
    },
  );
}
