import type { ApiError, ApiResponse } from "@/types";
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Options ──────────────────────────────────────────────────────────────────
interface ApiMutationOptions<TData, TVariables> extends Omit<
  UseMutationOptions<ApiResponse<TData>, ApiError, TVariables>,
  "mutationFn"
> {
  successMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: ApiMutationOptions<TData, TVariables>,
): UseMutationResult<ApiResponse<TData>, ApiError, TVariables> {
  const {
    successMessage,
    showSuccessToast = true,
    showErrorToast = true,
    onSuccess,
    onError,
    ...rest
  } = options ?? {};

  return useMutation<ApiResponse<TData>, ApiError, TVariables>({
    mutationFn,

    onSuccess: (data, variables, context, mutationContext) => {
      if (showSuccessToast) {
        toast.success(successMessage ?? data.message ?? "Success");
      }
      onSuccess?.(data, variables, context, mutationContext);
    },

    onError: (error, variables, context, mutationContext) => {
      if (showErrorToast) {
        toast.error(error.message ?? "Something went wrong");
      }
      onError?.(error, variables, context, mutationContext);
    },

    ...rest,
  });
}
