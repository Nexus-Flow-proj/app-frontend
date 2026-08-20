import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/types";
import { subscriptionService } from "../services";
import type { CheckoutDto } from "../types";

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (dto: CheckoutDto) => subscriptionService.createCheckout(dto),
    onSuccess: (res) => {
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    },
    onError: (err: ApiError) => {
      const message =
        typeof err.message === "string"
          ? err.message
          : Array.isArray(err.message)
            ? err.message[0]
            : "Failed to initiate checkout session.";
      toast.error(message);
    },
  });
}
