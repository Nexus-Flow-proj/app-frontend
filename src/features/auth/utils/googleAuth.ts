import { BASE_URL } from "@/constants";

export function handleGoogleAuth() {
  window.location.href = `${BASE_URL}/auth/google`;
}
