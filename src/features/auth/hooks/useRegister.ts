import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useAuthStore } from "@/store";
import { authService } from "../services";
import type { AuthResponseData, RegisterDto } from "../types";

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useApiMutation<AuthResponseData, RegisterDto>(
    (dto) => authService.register(dto),
    {
      showSuccessToast: false,
      onSuccess: (res) => {
        const { user } = res.data;
        setAuth(user);
        // Cookies carry auth credentials; the store only hydrates display/user state.
        toast.success("Account created! Welcome to Nexus-Flow.");
        navigate("/dashboard", { replace: true });
      },
    },
  );
}
