import { api } from "@/lib/api/axios";
import type {
  AuthResponseData,
  RefreshResponseData,
} from "../types/auth-response";
import type { ApiResponse } from "@/types";
import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "../types/auth-dto";

export const authService = {
  me: () =>
    api.get<ApiResponse<AuthResponseData>>("/auth/me").then((r) => r.data),

  optionalMe: () =>
    api
      .get<ApiResponse<AuthResponseData>>("/auth/me", {
        validateStatus: (status) => status < 500,
      })
      .then((r) => (r.status === 200 ? r.data.data : null)),

  login: (dto: LoginDto) =>
    api
      .post<ApiResponse<AuthResponseData>>("/auth/login", dto)
      .then((r) => r.data),

  register: (dto: RegisterDto) =>
    api
      .post<ApiResponse<AuthResponseData>>("/auth/signup", {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
        confirmPassword: dto.confirmPassword,
      })
      .then((r) => r.data),

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
};
