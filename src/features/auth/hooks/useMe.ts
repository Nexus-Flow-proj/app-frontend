import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { authService } from "../services";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: authService.me,
    select: (res) => res.data,
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
