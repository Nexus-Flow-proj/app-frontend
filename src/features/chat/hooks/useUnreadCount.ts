import { useApiQuery } from "@/hooks/useApiQuery";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { chatService } from "../services";
import type { UnreadCountResponse } from "../types";

export function useUnreadCount(projectId?: string) {
  return useApiQuery<UnreadCountResponse>(
    QUERY_KEYS.chat.unreadCount(projectId ?? ""),
    () => chatService.getUnreadCount(projectId ?? ""),
    {
      enabled: Boolean(projectId),
      staleTime: 1000 * 30, // 30 seconds
    },
  );
}
