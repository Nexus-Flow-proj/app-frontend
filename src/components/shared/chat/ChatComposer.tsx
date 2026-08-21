import React, { useRef } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  topBanner?: React.ReactNode;
  actionsLeft?: React.ReactNode;
  actionsRight?: React.ReactNode;
  helperText?: string;
  minRows?: number;
  className?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder = "Type a message…",
  disabled = false,
  isSubmitting = false,
  topBanner,
  actionsLeft,
  actionsRight,
  helperText = "Enter to send · Shift + Enter for a new line",
  className = "",
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && !isSubmitting && value.trim()) {
        onSubmit();
      }
    }
  }

  return (
    <div className={`p-3 space-y-2 bg-background ${className}`}>
      {topBanner}

      <div className="relative rounded-xl border border-input bg-muted/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSubmitting}
          placeholder={placeholder}
          className="min-h-[64px] max-h-32 w-full resize-none border-0 bg-transparent px-3 py-2.5 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
        />

        <div className="flex items-center justify-between border-t border-border/40 px-2.5 py-1.5 bg-background/50">
          <div className="flex items-center gap-1.5 min-w-0">
            {actionsLeft}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {actionsRight}
            <Button
              type="button"
              size="icon"
              className="size-7 rounded-lg"
              disabled={disabled || isSubmitting || !value.trim()}
              onClick={onSubmit}
              aria-label="Send message"
            >
              {isSubmitting ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {helperText ? (
        <p className="px-1 text-[10px] text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
