import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { chatService } from "../services";
import type { ChatMessage } from "../types";

export function usePinnedMessages(projectId?: string) {
  return useApiQuery<ChatMessage[]>(
    QUERY_KEYS.chat.pinned(projectId ?? ""),
    () => chatService.getPinnedMessages(projectId ?? ""),
    {
      enabled: Boolean(projectId),
    },
  );
}
