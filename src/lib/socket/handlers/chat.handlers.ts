import type { QueryClient, InfiniteData } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { SocketManager } from "../socket-manager";
import type {
  ChatMessageCreatedPayload,
  ChatMessageDeletedPayload,
  ChatMessagePinnedPayload,
  ChatMessageUnpinnedPayload,
  ChatMessageUpdatedPayload,
  ChatReactionAddedPayload,
  ChatReactionRemovedPayload,
  ChatReadPayload,
  ChatUserTypingPayload,
} from "../types/payloads";
import type { ChatMessage, GetMessagesResponse } from "@/features/chat/types";
import { useChatStore } from "@/store/chatStore";

export function registerChatHandlers(
  socketManager: SocketManager,
  qc: QueryClient,
): void {
  // 1. Message created
  socketManager.on(
    SOCKET_EVENTS.CHAT.MESSAGE_CREATED,
    (payload: ChatMessageCreatedPayload) => {
      const { projectId, message } = payload;

      // Update all message queries for this project
      qc.setQueriesData<InfiniteData<GetMessagesResponse>>(
        { queryKey: QUERY_KEYS.chat.messages(projectId) },
        (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return oldData;
          }

          // Check if message already exists in any page (e.g. from optimistic update)
          const exists = oldData.pages.some((page) =>
            page.messages.some((m) => m.id === message.id),
          );
          if (exists) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                messages: page.messages.map((m) =>
                  m.id === message.id ? message : m,
                ),
              })),
            };
          }

          // Prepend to the first page (newest messages)
          const newPages = [...oldData.pages];
          newPages[0] = {
            ...newPages[0],
            messages: [message, ...newPages[0].messages],
          };

          return {
            ...oldData,
            pages: newPages,
          };
        },
      );

      // Invalidate unread count
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.chat.unreadCount(projectId),
      });

      // If message is pinned, invalidate pinned list
      if (message.isPinned) {
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.chat.pinned(projectId),
        });
      }
    },
  );

  // 2. Message updated
  socketManager.on(
    SOCKET_EVENTS.CHAT.MESSAGE_UPDATED,
    (payload: ChatMessageUpdatedPayload) => {
      const { projectId, message } = payload;

      qc.setQueriesData<InfiniteData<GetMessagesResponse>>(
        { queryKey: QUERY_KEYS.chat.messages(projectId) },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.id === message.id ? message : m,
              ),
            })),
          };
        },
      );

      // Also update in pinned queries
      qc.setQueryData<ChatMessage[]>(
        QUERY_KEYS.chat.pinned(projectId),
        (oldPinned) => {
          if (!oldPinned) return oldPinned;
          return oldPinned.map((m) => (m.id === message.id ? message : m));
        },
      );
    },
  );

  // 3. Message deleted
  socketManager.on(
    SOCKET_EVENTS.CHAT.MESSAGE_DELETED,
    (payload: ChatMessageDeletedPayload) => {
      const { projectId, messageId } = payload;

      qc.setQueriesData<InfiniteData<GetMessagesResponse>>(
        { queryKey: QUERY_KEYS.chat.messages(projectId) },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.filter((m) => m.id !== messageId),
            })),
          };
        },
      );

      qc.setQueryData<ChatMessage[]>(
        QUERY_KEYS.chat.pinned(projectId),
        (oldPinned) => {
          if (!oldPinned) return oldPinned;
          return oldPinned.filter((m) => m.id !== messageId);
        },
      );
    },
  );

  // 4. Message pinned / unpinned
  const handlePinToggle = (
    payload: ChatMessagePinnedPayload | ChatMessageUnpinnedPayload,
  ) => {
    const { projectId, message } = payload;

    qc.setQueriesData<InfiniteData<GetMessagesResponse>>(
      { queryKey: QUERY_KEYS.chat.messages(projectId) },
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) =>
              m.id === message.id ? message : m,
            ),
          })),
        };
      },
    );

    qc.invalidateQueries({
      queryKey: QUERY_KEYS.chat.pinned(projectId),
    });
  };

  socketManager.on(SOCKET_EVENTS.CHAT.MESSAGE_PINNED, handlePinToggle);
  socketManager.on(SOCKET_EVENTS.CHAT.MESSAGE_UNPINNED, handlePinToggle);

  // 5. Reaction added
  socketManager.on(
    SOCKET_EVENTS.CHAT.REACTION_ADDED,
    (payload: ChatReactionAddedPayload) => {
      const { projectId, messageId, emoji, userId, user } = payload;

      const updateMessageReactions = (m: ChatMessage): ChatMessage => {
        if (m.id !== messageId) return m;
        // Check if reaction already exists
        const exists = m.reactions.some(
          (r) => r.emoji === emoji && r.user.id === userId,
        );
        if (exists) return m;

        const sender: ChatMessage["reactions"][0]["user"] = user ?? {
          id: userId,
          firstName: "Team",
          lastName: "Member",
          avatarUrl: null,
        };

        return {
          ...m,
          reactions: [
            ...m.reactions,
            {
              id: `${messageId}-${emoji}-${userId}`,
              emoji,
              user: sender,
            },
          ],
        };
      };

      qc.setQueriesData<InfiniteData<GetMessagesResponse>>(
        { queryKey: QUERY_KEYS.chat.messages(projectId) },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map(updateMessageReactions),
            })),
          };
        },
      );

      qc.setQueryData<ChatMessage[]>(
        QUERY_KEYS.chat.pinned(projectId),
        (oldPinned) => {
          if (!oldPinned) return oldPinned;
          return oldPinned.map(updateMessageReactions);
        },
      );
    },
  );

  // 6. Reaction removed
  socketManager.on(
    SOCKET_EVENTS.CHAT.REACTION_REMOVED,
    (payload: ChatReactionRemovedPayload) => {
      const { projectId, messageId, emoji, userId } = payload;

      const removeMessageReaction = (m: ChatMessage): ChatMessage => {
        if (m.id !== messageId) return m;
        return {
          ...m,
          reactions: m.reactions.filter(
            (r) => !(r.emoji === emoji && r.user.id === userId),
          ),
        };
      };

      qc.setQueriesData<InfiniteData<GetMessagesResponse>>(
        { queryKey: QUERY_KEYS.chat.messages(projectId) },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map(removeMessageReaction),
            })),
          };
        },
      );

      qc.setQueryData<ChatMessage[]>(
        QUERY_KEYS.chat.pinned(projectId),
        (oldPinned) => {
          if (!oldPinned) return oldPinned;
          return oldPinned.map(removeMessageReaction);
        },
      );
    },
  );

  // 7. User typing
  socketManager.on(
    SOCKET_EVENTS.CHAT.USER_TYPING,
    (payload: ChatUserTypingPayload) => {
      useChatStore.getState().setTypingUser({
        userId: payload.userId,
        userName: payload.userName,
        avatarUrl: payload.avatarUrl,
        isTyping: payload.isTyping,
      });
    },
  );

  // 8. Chat read
  socketManager.on(
    SOCKET_EVENTS.CHAT.READ,
    (payload: ChatReadPayload) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.chat.unreadCount(payload.projectId),
      });
    },
  );
}
