import { BASE_URL } from "@/constants";

export function handleGoogleAuth(pathname: string) {
  window.location.href = `${BASE_URL}/auth/google/login/${pathname}`;
}
