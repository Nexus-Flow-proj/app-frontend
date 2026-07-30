import { QUERY_KEYS } from "@/constants";
import { useApiQuery } from "@/hooks/useApiQuery";
import { draftService } from "../services";

export function useDraft(draftId: string | undefined) {
  return useApiQuery(
    QUERY_KEYS.drafts.detail(draftId ?? ""),
    () => draftService.getDraft(draftId ?? ""),
    {
      enabled: !!draftId,
      staleTime: 1000 * 60 * 2,
    },
  );
}
