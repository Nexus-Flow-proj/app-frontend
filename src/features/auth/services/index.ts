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

function normalizeUser(user: User): User {
  const fallbackName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return {
    ...user,
    name: (user.name ?? fallbackName) || user.email,
    avatar: user.avatar ?? user.avatarUrl,
  };
}

function normalizeAuthResponse(
  response: ApiResponse<AuthResponseData>,
): ApiResponse<AuthResponseData> {
  return {
    ...response,
    data: {
      ...response.data,
      user: normalizeUser(response.data.user),
    },
  };
}

export const authService = {
  me: () =>
    api.get<ApiResponse<User>>("/auth/me").then((r) => ({
      ...r.data,
      data: normalizeUser(r.data.data),
    })),

  login: (dto: LoginDto) =>
    api
      .post<ApiResponse<AuthResponseData>>("/auth/login", dto)
      .then((r) => normalizeAuthResponse(r.data)),

  register: (dto: RegisterDto) =>
    api
      .post<ApiResponse<AuthResponseData>>("/auth/signup", {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
        confirmPassword: dto.confirmPassword,
      })
      .then((r) => normalizeAuthResponse(r.data)),

  logout: () => api.post<ApiResponse<null>>("/auth/logout").then((r) => r.data),

  forgotPassword: (dto: ForgotPasswordDto) =>
    api
      .post<ApiResponse<null>>("/auth/forget-password", dto)
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
      .then((r) => normalizeAuthResponse(r.data)),
};
