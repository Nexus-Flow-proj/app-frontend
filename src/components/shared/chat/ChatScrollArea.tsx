import React, { useEffect, useRef, useState } from "react";
import { ArrowDown, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ChatScrollAreaProps {
  children: React.ReactNode;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  messagesCount?: number;
  className?: string;
}

export function ChatScrollArea({
  children,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  messagesCount = 0,
  className = "",
}: ChatScrollAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const prevCountRef = useRef<number>(messagesCount);

  // Auto-scroll to bottom on initial load and when message count increases (if already near bottom)
  useEffect(() => {
    if (messagesCount > prevCountRef.current) {
      if (!showScrollBottom) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else if (prevCountRef.current === 0 && messagesCount > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
    prevCountRef.current = messagesCount;
  }, [messagesCount, showScrollBottom]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    viewportRef.current = target;

    // Check distance from bottom
    const distanceFromBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;
    setShowScrollBottom(distanceFromBottom > 150);

    // Trigger load more when scrolled near top
    if (target.scrollTop < 60 && hasMore && !isLoadingMore && onLoadMore) {
      const prevScrollHeight = target.scrollHeight;
      onLoadMore();

      // Maintain scroll position after prepending older messages
      requestAnimationFrame(() => {
        if (viewportRef.current) {
          const newScrollHeight = viewportRef.current.scrollHeight;
          viewportRef.current.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    }
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottom(false);
  }

  return (
    <div className="relative flex-1 min-h-0">
      <ScrollArea
        className={`h-full w-full ${className}`}
        onScrollCapture={handleScroll}
      >
        <div className="flex flex-col min-h-full justify-end py-3">
          {/* Top load more indicator */}
          {hasMore ? (
            <div className="flex justify-center py-2">
              {isLoadingMore ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <LoaderCircle className="size-3.5 animate-spin" />
                  <span>Loading older messages…</span>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onLoadMore}
                  className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Load older messages
                </Button>
              )}
            </div>
          ) : null}

          {/* Messages */}
          {children}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Floating scroll to bottom button */}
      {showScrollBottom ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-3 right-3 size-8 rounded-full shadow-md border animate-in fade-in zoom-in-90"
          onClick={scrollToBottom}
          aria-label="Scroll to newest messages"
        >
          <ArrowDown className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
