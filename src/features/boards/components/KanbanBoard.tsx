// features/boards/components/KanbanBoard.tsx
// Dev 2 — board container. Dev 1 wraps children with DndContext on merge day.

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BoardState } from "../types";

interface KanbanBoardProps {
  boardState: BoardState;
  children: ReactNode;
  onAddColumn?: () => void;
  isLoading?: boolean;
}

function ColumnSkeleton() {
  return (
    <div className="w-[272px] shrink-0 rounded-2xl bg-card border border-border p-3.5 space-y-3">
      <Skeleton className="h-0.5 w-7" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-6 rounded-full" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-secondary border border-border p-3 space-y-2"
        >
          <Skeleton className="h-3 w-14 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex justify-between items-center pt-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="size-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyBoard({ onAddColumn }: { onAddColumn?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[360px] gap-4">
      <div className="size-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
        <svg
          className="size-7 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
          />
        </svg>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">No columns yet</p>
        <p className="text-xs text-muted-foreground">
          Add a column to start organizing tasks
        </p>
      </div>
      {onAddColumn && (
        <Button size="sm" onClick={onAddColumn} className="gap-1.5">
          <Plus className="size-3.5" /> Add first column
        </Button>
      )}
    </div>
  );
}

export function KanbanBoard({
  boardState,
  children,
  onAddColumn,
  isLoading = false,
}: KanbanBoardProps) {
  const hasColumns = boardState.columnOrder.length > 0;

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div
        className="flex items-start gap-3 px-5 pb-5 pt-4 h-full"
        style={{ minWidth: "max-content" }}
      >
        {isLoading ? (
          <>
            <ColumnSkeleton />
            <ColumnSkeleton />
            <ColumnSkeleton />
          </>
        ) : !hasColumns ? (
          <EmptyBoard onAddColumn={onAddColumn} />
        ) : (
          <>
            {children}
            {/* Add column — ghost button at the end */}
            <button
              onClick={onAddColumn}
              className="flex items-center gap-2 w-[248px] shrink-0 h-fit px-4 py-2.5 rounded-2xl
                         border border-dashed border-border text-muted-foreground hover:text-foreground
                         hover:border-border/80 hover:bg-muted/50 transition-all duration-200 text-sm"
            >
              <div className="size-5 rounded-md bg-muted flex items-center justify-center">
                <Plus className="size-3" />
              </div>
              Add column
            </button>
          </>
        )}
      </div>
    </div>
  );
}
