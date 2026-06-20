import { BASE_URL } from "@/constants";

export function handleGoogleLogin() {
  window.location.href = `${BASE_URL}/auth/google`;
}
