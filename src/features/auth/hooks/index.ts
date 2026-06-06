import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { setAccessToken } from "@/lib/axios";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { User } from "@/types";
import { authService } from "../services";
import type {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../types";
import { QUERY_KEYS } from "@/constants/queryKeys";

type AuthResponseData = { user: User; accessToken: string };

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: authService.me,
    select: (res) => res.data,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation<AuthResponseData, LoginDto>(
    (dto: LoginDto) => authService.login(dto),
    {
      showSuccessToast: false,
      onSuccess: (res) => {
        const { user, accessToken } = res.data;
        setAuth(user, accessToken);
        setAccessToken(accessToken);
        queryClient.setQueryData(QUERY_KEYS.auth.me, res);
        toast.success(`Welcome back, ${user.name}!`);
        navigate("/dashboard", { replace: true });
      },
    },
  );
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useApiMutation<AuthResponseData, RegisterDto>(
    (dto: RegisterDto) => authService.register(dto),
    {
      successMessage: "Account created! Welcome to Nexus-Flow.",
      onSuccess: (res) => {
        const { user, accessToken } = res.data;
        setAuth(user, accessToken);
        setAccessToken(accessToken);
        navigate("/dashboard", { replace: true });
      },
    },
  );
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useApiMutation(() => authService.logout(), {
    showSuccessToast: false,
    showErrorToast: false,
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
}

export function useForgotPassword() {
  return useApiMutation((dto: ForgotPasswordDto) =>
    authService.forgotPassword(dto),
  );
}

export function useResetPassword() {
  const navigate = useNavigate();

  return useApiMutation(
    (dto: ResetPasswordDto) => authService.resetPassword(dto),
    {
      onSuccess: () => {
        navigate("/login", { replace: true });
      },
    },
  );
}

export function useInvitePreview(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: () => authService.getInvite(token),
    select: (res) => res.data,
    enabled: !!token,
    retry: false,
  });
}

export function useInviteAccept() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useApiMutation<AuthResponseData, string>(
    (token: string) => authService.acceptInvite(token),
    {
      successMessage: "Invite accepted! Welcome to the project.",
      onSuccess: (res) => {
        const { user, accessToken } = res.data;
        setAuth(user, accessToken);
        setAccessToken(accessToken);
        navigate("/dashboard", { replace: true });
      },
    },
  );
}
