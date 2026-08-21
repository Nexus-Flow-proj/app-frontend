import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ChatMessageBubbleProps {
  isOwn?: boolean;
  senderName: string;
  senderAvatarUrl?: string | null;
  timestamp?: string;
  isEdited?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  headerBadge?: React.ReactNode;
  className?: string;
  bubbleClassName?: string;
}

export function ChatMessageBubble({
  isOwn = false,
  senderName,
  senderAvatarUrl,
  timestamp,
  isEdited = false,
  children,
  actions,
  footer,
  headerBadge,
  className = "",
  bubbleClassName = "",
}: ChatMessageBubbleProps) {
  const initials = senderName
    ? senderName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={`group relative flex gap-2.5 px-3 py-1.5 transition-colors hover:bg-muted/30 ${
        isOwn ? "flex-row-reverse" : "flex-row"
      } ${className}`}
    >
      {/* Avatar */}
      <Avatar className="size-7 shrink-0 ring-1 ring-border/50">
        {senderAvatarUrl ? (
          <AvatarImage src={senderAvatarUrl} alt={senderName} />
        ) : null}
        <AvatarFallback className="text-[11px] font-medium bg-muted text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Message content column */}
      <div
        className={`flex max-w-[80%] flex-col ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* Sender info header */}
        <div
          className={`flex items-center gap-1.5 mb-1 text-[11px] ${
            isOwn ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span className="font-semibold text-foreground/90 truncate max-w-[120px]">
            {senderName}
          </span>
          {headerBadge}
          {timestamp ? (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {timestamp}
            </span>
          ) : null}
          {isEdited ? (
            <span className="text-[10px] italic text-muted-foreground shrink-0">
              (edited)
            </span>
          ) : null}
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words relative shadow-xs ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-xs"
              : "bg-muted/80 text-foreground rounded-tl-xs"
          } ${bubbleClassName}`}
        >
          {children}
        </div>

        {/* Reactions / Custom footer */}
        {footer ? <div className="mt-1">{footer}</div> : null}
      </div>

      {/* Hover action bar */}
      {actions ? (
        <div
          className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
            isOwn ? "left-3" : "right-3"
          }`}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
