import { create } from "zustand";
import type { ChatMessage, TypingUser } from "@/features/chat/types";

interface ChatStoreState {
  isOpen: boolean;
  isPinnedDrawerOpen: boolean;
  replyTo: ChatMessage | null;
  editingMessage: ChatMessage | null;
  searchQuery: string;
  typingUsers: Record<string, TypingUser>; // key: userId

  // Actions
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  openChat: () => void;
  closeChat: () => void;
  setIsPinnedDrawerOpen: (isOpen: boolean) => void;
  setReplyTo: (message: ChatMessage | null) => void;
  setEditingMessage: (message: ChatMessage | null) => void;
  setSearchQuery: (query: string) => void;
  setTypingUser: (typing: TypingUser) => void;
  clearTypingUsers: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatStoreState>()((set) => ({
  isOpen: false,
  isPinnedDrawerOpen: false,
  replyTo: null,
  editingMessage: null,
  searchQuery: "",
  typingUsers: {},

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setIsPinnedDrawerOpen: (isPinnedDrawerOpen) => set({ isPinnedDrawerOpen }),
  setReplyTo: (replyTo) => set({ replyTo, editingMessage: null }),
  setEditingMessage: (editingMessage) =>
    set({ editingMessage, replyTo: null }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTypingUser: (typing) =>
    set((state) => {
      const next = { ...state.typingUsers };
      if (typing.isTyping) {
        next[typing.userId] = typing;
      } else {
        delete next[typing.userId];
      }
      return { typingUsers: next };
    }),
  clearTypingUsers: () => set({ typingUsers: {} }),
  reset: () =>
    set({
      isOpen: false,
      isPinnedDrawerOpen: false,
      replyTo: null,
      editingMessage: null,
      searchQuery: "",
      typingUsers: {},
    }),
}));
