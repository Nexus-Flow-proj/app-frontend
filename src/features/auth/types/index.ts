import type { User } from "@/types";

// ─── Response shapes ──────────────────────────────────────────────────────────
export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface RefreshResponseData {
  accessToken: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}
