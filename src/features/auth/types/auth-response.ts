import type { User } from "@/types";

export interface AuthResponseData {
  user: User;
  csrfToken?: string;
}

export interface RefreshResponseData {
  csrfToken?: string;
}
