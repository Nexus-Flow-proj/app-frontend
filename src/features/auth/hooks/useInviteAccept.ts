import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useAuthStore } from "@/store";
import { authService } from "../services";
import type { AuthResponseData } from "../types/auth-response";

export function useInviteAccept() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useApiMutation<AuthResponseData, string>(
    (token) => authService.acceptInvite(token),
    {
      showSuccessToast: false,
      onSuccess: (res) => {
        const { user } = res.data;
        setAuth(user);
        toast.success("Invite accepted! Welcome to the project.");
        navigate("/dashboard", { replace: true });
      },
    },
  );
}
