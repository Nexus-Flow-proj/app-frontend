import { useQuery } from "@tanstack/react-query";
import { authService } from "../services";

export function useInvitePreview(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: () => authService.getInvite(token),
    select: (res) => res.data,
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}
