import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BoardSyncStatus } from "@/store/kanbanStore";

interface BoardSyncIndicatorProps {
  status: BoardSyncStatus;
}

export function BoardSyncIndicator({ status }: BoardSyncIndicatorProps) {
  if (status === "idle") return null;

  const isSyncing = status === "syncing";
  const isSuccess = status === "success";

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
        isSyncing &&
          "border-border bg-muted text-muted-foreground",
        isSuccess &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
        status === "error" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {isSyncing ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : isSuccess ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <AlertCircle className="size-3.5" />
      )}
      <span>
        {isSyncing
          ? "Syncing changes"
          : isSuccess
            ? "Sync successful"
            : "Sync failed"}
      </span>
    </div>
  );
}
