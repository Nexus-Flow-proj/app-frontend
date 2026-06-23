import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { authService } from "../services";

export function useInvitePreview(token: string) {
  return useApiQuery(
    QUERY_KEYS.auth.invitePreview(token),
    () => authService.getInvite(token),
    {
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    },
  );
}
