import { useEffect, useRef } from "react";
import { ChatShell } from "@/components/shared/chat";
import { useChatStore } from "@/store/chatStore";
import { useProjectStore } from "@/store/projectStore";
import { useMarkAsRead } from "../hooks";
import { ChatHeaderActions, ChatHeaderIcon } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatComposerBar } from "./ChatComposerBar";
import { ChatPinnedDrawer } from "./ChatPinnedDrawer";

import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";

interface ChatPanelProps {
  projectId: string;
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const queryClient = useQueryClient();
  const isOpen = useChatStore((state) => state.isOpen);
  const setIsOpen = useChatStore((state) => state.setIsOpen);
  const projectName = useProjectStore((state) => state.activeProject?.name);
  const markAsReadMutation = useMarkAsRead(projectId);
  const prevOpenRef = useRef(false);

  // When chat transitions (opened or closed), sync read state with backend
  useEffect(() => {
    if (projectId) {
      if (isOpen || prevOpenRef.current) {
        // Optimistically set unreadCount to 0 synchronously to prevent badge flashing
        queryClient.setQueryData(QUERY_KEYS.chat.unreadCount(projectId), {
          unreadCount: 0,
        });
        markAsReadMutation.mutate(undefined);
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, projectId, queryClient]);

  return (
    <ChatShell
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Project Chat"
      subtitle={projectName ?? "Team Discussion & Announcements"}
      icon={<ChatHeaderIcon />}
      headerActions={<ChatHeaderActions projectId={projectId} />}
      ariaLabel="Project group chat and announcements"
      footer={<ChatComposerBar projectId={projectId} />}
    >
      <div className="relative flex-1 flex flex-col min-h-0">
        <ChatMessageList projectId={projectId} />
        <ChatPinnedDrawer projectId={projectId} />
      </div>
    </ChatShell>
  );
}
