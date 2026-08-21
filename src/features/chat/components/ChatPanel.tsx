import { useEffect, useRef } from "react";
import { ChatShell } from "@/components/shared/chat";
import { useChatStore } from "@/store/chatStore";
import { useProjectStore } from "@/store/projectStore";
import { useMarkAsRead } from "../hooks";
import { ChatHeaderActions, ChatHeaderIcon } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatComposerBar } from "./ChatComposerBar";
import { ChatPinnedDrawer } from "./ChatPinnedDrawer";

interface ChatPanelProps {
  projectId: string;
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const isOpen = useChatStore((state) => state.isOpen);
  const setIsOpen = useChatStore((state) => state.setIsOpen);
  const projectName = useProjectStore((state) => state.activeProject?.name);
  const markAsReadMutation = useMarkAsRead(projectId);
  const prevOpenRef = useRef(false);

  // When chat transitions from closed to open, mark messages as read
  useEffect(() => {
    if (isOpen && !prevOpenRef.current && projectId) {
      markAsReadMutation.mutate(undefined);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, projectId]);

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
