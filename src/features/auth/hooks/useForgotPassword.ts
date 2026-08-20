import { useApiMutation } from "@/hooks/useApiMutation";
import { authService } from "../services";
import type { ForgotPasswordDto } from "../types/auth-dto";

export function useForgotPassword() {
  return useApiMutation<null, ForgotPasswordDto>(
    (dto) => authService.forgotPassword(dto),
    {
      showSuccessToast: true,
      successMessage: "Reset link sent — check your email",
    },
  );
}
