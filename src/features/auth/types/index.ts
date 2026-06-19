import type { User } from "@/types";

// ─── Response shapes ──────────────────────────────────────────────────────────
export interface AuthResponseData {
  user: User;
}

export type RefreshResponseData = null;

// ─── Request DTOs ─────────────────────────────────────────────────────────────
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  preference?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
