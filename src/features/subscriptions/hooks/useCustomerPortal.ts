import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/types";
import { subscriptionService } from "../services";

export function useCustomerPortal() {
  return useMutation({
    mutationFn: () => subscriptionService.createCustomerPortal(),
    onSuccess: (res) => {
      if (res.data?.portalUrl) {
        window.location.href = res.data.portalUrl;
      }
    },
    onError: (err: ApiError) => {
      const message =
        typeof err.message === "string"
          ? err.message
          : Array.isArray(err.message)
            ? err.message[0]
            : "Failed to open billing portal.";
      toast.error(message);
    },
  });
}
