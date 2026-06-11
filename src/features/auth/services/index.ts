import { api } from "@/lib/axios";
import type {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseData,
  RefreshResponseData,
} from "../types";
import type { ApiResponse, InvitePreview, User } from "@/types";

export const authService = {
  me: () => api.get<ApiResponse<User>>("/auth/me").then((r) => r.data),

  login: (dto: LoginDto) =>
    api
      .post<ApiResponse<AuthResponseData>>("/auth/login", dto)
      .then((r) => r.data),

  register: (dto: RegisterDto) =>
    api
      .post<ApiResponse<AuthResponseData>>("/auth/register", dto)
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

  refresh: () =>
    api
      .post<ApiResponse<RefreshResponseData>>("/auth/refresh")
      .then((r) => r.data),

  getInvite: (token: string) =>
    api
      .get<ApiResponse<InvitePreview>>(`/auth/invite/${token}`)
      .then((r) => r.data),

  acceptInvite: (token: string) =>
    api
      .post<ApiResponse<AuthResponseData>>(`/auth/invite/${token}/accept`)
      .then((r) => r.data),
};
