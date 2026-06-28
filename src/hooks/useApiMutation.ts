import type { ApiError, ApiResponse } from "@/types";
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessages, getApiMessage } from "../lib/api/Messages";

interface ApiMutationOptions<TData, TVariables> extends Omit<
  UseMutationOptions<ApiResponse<TData>, ApiError, TVariables>,
  "mutationFn"
> {
  successMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

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

    onSuccess: async (data, variables, context, mutationContext) => {
      console.log(data);

      if (showSuccessToast) {
        toast.success(successMessage ?? getApiMessage(data.message));
      }
      await onSuccess?.(data, variables, context, mutationContext);
    },

    onError: (error, variables, context, mutationContext) => {
      console.log(error);

      if (showErrorToast) {
        getApiErrorMessages(error).forEach((message) => {
          toast.error(message);
        });
      }
      onError?.(error, variables, context, mutationContext);
    },

    ...rest,
  });
}
