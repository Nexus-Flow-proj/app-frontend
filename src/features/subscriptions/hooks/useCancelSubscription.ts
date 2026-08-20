import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { ApiError } from "@/types";
import { subscriptionService } from "../services";

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionService.cancelSubscription(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subscriptions.me(),
      });
      toast.success(
        res.message ??
          "Subscription scheduled for cancellation at the end of the billing period.",
      );
    },
    onError: (err: ApiError) => {
      const message =
        typeof err.message === "string"
          ? err.message
          : Array.isArray(err.message)
            ? err.message[0]
            : "Failed to cancel subscription.";
      toast.error(message);
    },
  });
}
