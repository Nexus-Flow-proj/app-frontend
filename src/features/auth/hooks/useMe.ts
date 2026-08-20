import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { authService } from "../services";
import type { AuthResponseData } from "../types/auth-response";

export function useMe(enabled = true) {
  return useApiQuery<AuthResponseData | null>(QUERY_KEYS.auth.me, authService.me, {
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
