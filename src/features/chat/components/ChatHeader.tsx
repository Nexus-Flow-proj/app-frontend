import { useState } from "react";
import { MessageCircle, Pin, Search, X } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { usePinnedMessages } from "../hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderActionsProps {
  projectId: string;
}

export function ChatHeaderActions({ projectId }: ChatHeaderActionsProps) {
  const isPinnedDrawerOpen = useChatStore((state) => state.isPinnedDrawerOpen);
  const setIsPinnedDrawerOpen = useChatStore(
    (state) => state.setIsPinnedDrawerOpen,
  );
  const searchQuery = useChatStore((state) => state.searchQuery);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);
  const { data: pinnedMessages } = usePinnedMessages(projectId);
  const [showSearch, setShowSearch] = useState(false);

  const pinnedCount = pinnedMessages?.length ?? 0;

  return (
    <div className="flex items-center gap-1">
      {showSearch ? (
        <div className="flex items-center gap-1 animate-in fade-in">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            className="h-7 w-32 px-2 text-xs"
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => {
              setSearchQuery("");
              setShowSearch(false);
            }}
            aria-label="Close search"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setShowSearch(true)}
              aria-label="Search chat"
            >
              <Search className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Search messages
          </TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isPinnedDrawerOpen ? "secondary" : "ghost"}
            size="icon"
            className="relative size-8"
            onClick={() => setIsPinnedDrawerOpen(!isPinnedDrawerOpen)}
            aria-label="View pinned messages"
          >
            <Pin className="size-4" />
            {pinnedCount > 0 ? (
              <Badge
                variant="default"
                className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[9px] rounded-full"
              >
                {pinnedCount}
              </Badge>
            ) : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Pinned messages ({pinnedCount})
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function ChatHeaderIcon() {
  return <MessageCircle className="size-4" />;
}
