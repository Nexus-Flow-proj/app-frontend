import { useNavigate } from "react-router";
import { useApiMutation } from "@/hooks/useApiMutation";
import { authService } from "../services";
import type { ResetPasswordDto } from "../types/auth-dto";

export function useResetPassword() {
  const navigate = useNavigate();

  return useApiMutation<null, ResetPasswordDto>(
    (dto) => authService.resetPassword(dto),
    {
      successMessage: "Password reset successfully",
      onSuccess: () => {
        navigate("/login", { replace: true });
      },
    },
  );
}
