import { useParams } from "react-router";
import { useProjectStore } from "@/store/projectStore";
import { useProjectRealTime } from "@/hooks/realtime/useProjectRealtime";
import { ChatFab } from "./ChatFab";
import { ChatPanel } from "./ChatPanel";

interface ProjectChatWidgetProps {
  explicitProjectId?: string;
}

export function ProjectChatWidget({
  explicitProjectId,
}: ProjectChatWidgetProps) {
  const { id } = useParams<{ id: string }>();
  const activeProjectId = useProjectStore((state) => state.activeProject?.id);
  const projectId = explicitProjectId || id || activeProjectId;

  const isMember = useProjectStore((state) => state.isMember());
  const canRead = useProjectStore((state) => state.hasPermission("chat.read"));

  // Ensures socket is in project room to receive real-time messages
  useProjectRealTime(projectId);

  if (!projectId || (!isMember && !explicitProjectId) || !canRead) {
    return null;
  }

  return (
    <>
      <ChatFab projectId={projectId} />
      <ChatPanel projectId={projectId} />
    </>
  );
}
