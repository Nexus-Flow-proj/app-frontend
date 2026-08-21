import { CornerDownRight, Reply, X } from "lucide-react";
import type { ChatMessage } from "../types";
import { Button } from "@/components/ui/button";

interface MessageReplyQuoteProps {
  parentMessage?: ChatMessage | null;
  isOwn?: boolean;
}

export function MessageReplyQuote({
  parentMessage,
  isOwn = false,
}: MessageReplyQuoteProps) {
  if (!parentMessage) return null;

  return (
    <div
      className={`flex items-start gap-1.5 rounded-lg px-2 py-1 mb-1.5 text-[11px] border-l-2 ${
        isOwn
          ? "border-primary-foreground/60 bg-primary-foreground/15 text-primary-foreground/90"
          : "border-primary/60 bg-muted text-foreground/80"
      }`}
    >
      <CornerDownRight className="size-3 shrink-0 mt-0.5 opacity-70" />
      <div className="min-w-0 flex-1">
        <span className="font-semibold block truncate">
          {parentMessage.sender.firstName} {parentMessage.sender.lastName}
        </span>
        <p className="truncate text-[10px] opacity-80">
          {parentMessage.content || "[Attachment]"}
        </p>
      </div>
    </div>
  );
}

interface ComposerReplyBannerProps {
  replyTo: ChatMessage | null;
  onCancel: () => void;
}

export function ComposerReplyBanner({
  replyTo,
  onCancel,
}: ComposerReplyBannerProps) {
  if (!replyTo) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <Reply className="size-3.5 text-primary shrink-0" />
        <div className="min-w-0">
          <span className="font-medium text-foreground">
            Replying to {replyTo.sender.firstName} {replyTo.sender.lastName}
          </span>
          <p className="truncate text-[11px] text-muted-foreground">
            {replyTo.content || "[Attachment]"}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-5 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
        onClick={onCancel}
        aria-label="Cancel reply"
      >
        <X className="size-3" />
      </Button>
    </div>
  );
}
