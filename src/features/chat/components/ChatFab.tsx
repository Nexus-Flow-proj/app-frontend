import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router";
import { useChatStore } from "@/store/chatStore";
import { useUnreadCount } from "../hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatFabProps {
  projectId: string;
}

export function ChatFab({ projectId }: ChatFabProps) {
  const { isOpen, toggleOpen } = useChatStore();
  const { data: unreadData } = useUnreadCount(projectId);
  const location = useLocation();

  const unreadCount = unreadData?.unreadCount ?? 0;

  // On workshop canvas pages, the AI assistant FAB is at right-4/5. Offset the Team Chat FAB to avoid overlap.
  const isWorkshopPage = location.pathname.includes("/workshop");

  return (
    <Button
      type="button"
      size="icon"
      className={`fixed bottom-5 z-40 size-12 rounded-full shadow-xl transition-all hover:scale-105 ${isWorkshopPage ? "right-20 sm:right-20" : "right-4 sm:right-5"
        } ${isOpen ? "bg-primary/90 ring-2 ring-primary/30" : ""}`}
      onClick={toggleOpen}
      aria-label={isOpen ? "Close project chat" : "Open project chat"}
      aria-expanded={isOpen}
    >
      <MessageCircle className="size-5" />

      {/* Unread badge */}
      {unreadCount > 0 && !isOpen ? (
        <Badge
          variant="outline"
          className="absolute  -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-bold bg-primary-700 rounded-full animate-in bg zoom-in"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      ) : null}
    </Button>
  );
}
