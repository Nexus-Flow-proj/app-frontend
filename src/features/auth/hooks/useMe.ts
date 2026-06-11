import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useAuthStore } from "@/store";
import { authService } from "../services";

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: authService.me,
    select: (res) => res.data,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
