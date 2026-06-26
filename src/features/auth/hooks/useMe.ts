import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { authService } from "../services";

export function useMe(enabled = true) {
  return useApiQuery(QUERY_KEYS.auth.me, authService.me, {
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
