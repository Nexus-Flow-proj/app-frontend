import { useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { chatService } from "../services";
import type { ChatMessage, GetMessagesParams, GetMessagesResponse } from "../types";

export function useChatMessages(
  projectId?: string,
  params?: Omit<GetMessagesParams, "cursor">,
) {
  return useInfiniteQuery<
    GetMessagesResponse,
    Error,
    { messages: ChatMessage[]; hasMore: boolean },
    ReturnType<typeof QUERY_KEYS.chat.messages>,
    string | undefined
  >({
    queryKey: QUERY_KEYS.chat.messages(projectId ?? "", params),
    queryFn: async ({ pageParam }) => {
      if (!projectId) {
        return { messages: [], nextCursor: null, hasMore: false };
      }
      const res = await chatService.getMessages(projectId, {
        ...params,
        cursor: pageParam,
      });
      return res.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore && lastPage.nextCursor
        ? lastPage.nextCursor
        : undefined;
    },
    enabled: Boolean(projectId),
    select: (data) => {
      const seen = new Set<string>();
      // Flatten all pages
      const allMessages = data.pages.flatMap((page) => page.messages);

      // Deduplicate
      const uniqueMessages: ChatMessage[] = [];
      for (const msg of allMessages) {
        if (!seen.has(msg.id)) {
          seen.add(msg.id);
          uniqueMessages.push(msg);
        }
      }

      // Backend returns newest first. For standard chat display (top=old, bottom=new),
      // sort by createdAt ascending.
      uniqueMessages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      const lastPage = data.pages[data.pages.length - 1];

      return {
        messages: uniqueMessages,
        hasMore: lastPage?.hasMore ?? false,
      };
    },
  });
}
