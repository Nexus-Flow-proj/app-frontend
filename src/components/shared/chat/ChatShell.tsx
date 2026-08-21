import React from "react";
import { Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ChatShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function ChatShell({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  headerActions,
  children,
  footer,
  className = "",
  ariaLabel = "Chat panel",
}: ChatShellProps) {
  if (!open) return null;

  return (
    <section
      aria-label={ariaLabel}
      className={`fixed bottom-20 right-3 z-50 flex h-[min(640px,calc(100vh-6.5rem))] w-[min(440px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:right-5 ${className}`}
    >
      <header className="flex items-center gap-3 border-b bg-muted/25 px-4 py-3 shrink-0">
        {icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {headerActions}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onOpenChange(false)}
            aria-label="Minimize chat"
          >
            <Minus className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>

      {footer ? <div className="border-t bg-background shrink-0">{footer}</div> : null}
    </section>
  );
}
