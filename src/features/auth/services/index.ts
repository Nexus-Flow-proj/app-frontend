import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/models";
import type { User, InvitePreview } from "@/types/models";
import type {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../types";

export const authService = {
  me: () => api.get<ApiResponse<User>>("/auth/me").then((r) => r.data),

  login: (dto: LoginDto) =>
    api
      .post<
        ApiResponse<{ user: User; accessToken: string }>
      >("/auth/login", dto)
      .then((r) => r.data),

  register: (dto: RegisterDto) =>
    api
      .post<
        ApiResponse<{ user: User; accessToken: string }>
      >("/auth/register", dto)
      .then((r) => r.data),

  logout: () => api.post<ApiResponse<null>>("/auth/logout").then((r) => r.data),

  forgotPassword: (dto: ForgotPasswordDto) =>
    api
      .post<ApiResponse<null>>("/auth/forgot-password", dto)
      .then((r) => r.data),

  resetPassword: (dto: ResetPasswordDto) =>
    api
      .post<ApiResponse<null>>("/auth/reset-password", dto)
      .then((r) => r.data),

  refreshToken: () =>
    api
      .post<ApiResponse<{ accessToken: string }>>("/auth/refresh")
      .then((r) => r.data),

  getInvite: (token: string) =>
    api
      .get<ApiResponse<InvitePreview>>(`/auth/invite/${token}`)
      .then((r) => r.data),

  acceptInvite: (token: string) =>
    api
      .post<
        ApiResponse<{ user: User; accessToken: string }>
      >(`/auth/invite/${token}/accept`)
      .then((r) => r.data),
};
