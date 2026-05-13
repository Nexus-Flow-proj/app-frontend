import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { setAccessToken } from "@/lib/axios";
import { authService } from "../services";
import type {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../types";
import { QUERY_KEYS } from "@/constants/queryKeys";

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

  return useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: (res) => {
      const { user, accessToken } = res.data;
      setAuth(user, accessToken);
      setAccessToken(accessToken);
      queryClient.setQueryData(QUERY_KEYS.auth.me, res);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/dashboard", { replace: true });
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Login failed");
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: RegisterDto) => authService.register(dto),
    onSuccess: (res) => {
      const { user, accessToken } = res.data;
      setAuth(user, accessToken);
      setAccessToken(accessToken);
      toast.success("Account created! Welcome to Nexus-Flow.");
      navigate("/dashboard", { replace: true });
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Registration failed");
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => authService.forgotPassword(dto),
    onSuccess: (res) => {
      toast.success(res.message ?? "Reset link sent to your email");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to send reset link");
    },
  });
}

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => authService.resetPassword(dto),
    onSuccess: (res) => {
      toast.success(res.message ?? "Password reset successfully");
      navigate("/login", { replace: true });
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to reset password");
    },
  });
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

  return useMutation({
    mutationFn: (token: string) => authService.acceptInvite(token),
    onSuccess: (res) => {
      const { user, accessToken } = res.data;
      setAuth(user, accessToken);
      setAccessToken(accessToken);
      toast.success("Invite accepted! Welcome to the project.");
      navigate("/dashboard", { replace: true });
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to accept invite");
    },
  });
}
