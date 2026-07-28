import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { draftService } from "../services";

export function useDrafts() {
  return useApiQuery(QUERY_KEYS.drafts.list(), draftService.getDrafts, {
    staleTime: 1000 * 60 * 2,
  });
}
