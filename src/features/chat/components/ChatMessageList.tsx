import { useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { ChatScrollArea } from "@/components/shared/chat";
import { useChatMessages } from "../hooks";
import { useChatStore } from "@/store/chatStore";
import { groupMessagesByDate } from "../utils";
import type { ChatMessage } from "../types";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageListProps {
  projectId: string;
}

export function ChatMessageList({ projectId }: ChatMessageListProps) {
  const searchQuery = useChatStore((state) => state.searchQuery);

  const queryParams = useMemo(
    () => (searchQuery ? { search: searchQuery } : undefined),
    [searchQuery],
  );

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useChatMessages(projectId, queryParams);

  const messages = data?.messages ?? [];

  // Create quick lookup for parent messages in reply threads
  const messageMap = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    messages.forEach((msg) => map.set(msg.id, msg));
    return map;
  }, [messages]);

  // Group messages chronologically by date headers
  const grouped = useMemo(() => groupMessagesByDate(messages), [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4">
        <div className="flex items-start gap-2.5">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-14 w-[60%] rounded-2xl" />
        </div>
        <div className="flex flex-row-reverse items-start gap-2.5">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-10 w-[45%] rounded-2xl" />
        </div>
        <div className="flex items-start gap-2.5">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-20 w-[70%] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/50 mb-3">
          <MessageCircle className="size-6 text-primary/60" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          {searchQuery ? "No matching messages" : "Welcome to Project Chat"}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
          {searchQuery
            ? `No messages found matching "${searchQuery}".`
            : "Share updates, ask questions, or broadcast announcements with your team."}
        </p>
      </div>
    );
  }

  return (
    <ChatScrollArea
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={() => fetchNextPage()}
      messagesCount={messages.length}
    >
      <div className="space-y-4 px-2">
        {grouped.map((group) => (
          <div key={group.dateHeader} className="space-y-2">
            {/* Date separator header */}
            <div className="flex items-center justify-center my-2">
              <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-xs">
                {group.dateHeader}
              </span>
            </div>

            {/* Messages in date group */}
            <div className="space-y-1">
              {group.messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  parentMessage={
                    message.parentMessageId
                      ? messageMap.get(message.parentMessageId)
                      : null
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time typing indicators */}
      <ChatTypingIndicator />
    </ChatScrollArea>
  );
}
