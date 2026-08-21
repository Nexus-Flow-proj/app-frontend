import { QUICK_EMOJIS } from "../constants";
import type { ChatReaction } from "../types";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatReactionBarProps {
  reactions: ChatReaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  canSend?: boolean;
}

export function ChatReactionBar({
  reactions,
  onAddReaction,
  onRemoveReaction,
  canSend = true,
}: ChatReactionBarProps) {
  const currentUserId = useAuthStore((state) => state.user?.id);

  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const grouped = reactions.reduce<
    Record<string, { count: number; users: string[]; hasOwn: boolean }>
  >((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { count: 0, users: [], hasOwn: false };
    }
    acc[reaction.emoji].count += 1;
    acc[reaction.emoji].users.push(
      `${reaction.user.firstName} ${reaction.user.lastName}`.trim(),
    );
    if (reaction.user.id === currentUserId) {
      acc[reaction.emoji].hasOwn = true;
    }
    return acc;
  }, {});

  function handleToggle(emoji: string, hasOwn: boolean) {
    if (!canSend) return;
    if (hasOwn) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(grouped).map(([emoji, data]) => (
        <Tooltip key={emoji}>
          <TooltipTrigger asChild>
            <Badge
              variant={data.hasOwn ? "default" : "secondary"}
              onClick={() => handleToggle(emoji, data.hasOwn)}
              className={`cursor-pointer gap-1 px-1.5 py-0.5 text-[10px] font-normal transition-all hover:scale-105 ${
                data.hasOwn
                  ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/20"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>{emoji}</span>
              <span className="font-semibold">{data.count}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>{data.users.slice(0, 5).join(", ")}{data.users.length > 5 ? ` +${data.users.length - 5} more` : ""}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

interface QuickReactionTriggerProps {
  onSelectEmoji: (emoji: string) => void;
  className?: string;
}

export function QuickReactionTrigger({
  onSelectEmoji,
  className = "",
}: QuickReactionTriggerProps) {
  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border border-border/80 bg-background/95 p-0.5 shadow-md backdrop-blur-xs ${className}`}
    >
      {QUICK_EMOJIS.map((emoji) => (
        <Button
          key={emoji}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onSelectEmoji(emoji)}
          className="size-6 rounded-full text-xs hover:scale-125 transition-transform"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}
