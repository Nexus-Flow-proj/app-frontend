// features/boards/components/KanbanBoard.tsx
// Dev 2 — styled board container.
// Dev 1 wraps this with DndContext and SortableContext.
// Dev 3 passes real data in after merge day.

import type { ReactNode } from "react";
import type { BoardState } from "../types/types.index (1)";
import { AddColumnButton } from "./AddColumnButton";

interface KanbanBoardProps {
  boardState: BoardState;
  children: ReactNode; // Dev 1 renders the columns here with dnd wiring
  onAddColumn?: () => void;
  isLoading?: boolean;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function ColumnSkeleton() {
  return (
    <div className="w-[300px] shrink-0 rounded-2xl bg-[#14141f] border border-white/[0.06] p-4 space-y-3 animate-pulse">
      <div className="h-2 w-8 rounded-full bg-white/10" />
      <div className="flex items-center gap-2">
        <div className="h-4 w-28 rounded bg-white/10" />
        <div className="h-4 w-6 rounded-full bg-white/10" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-[#1c1c28] border border-white/[0.07] p-3 space-y-2"
        >
          <div className="h-3 w-14 rounded-full bg-white/10" />
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-3 w-3/4 rounded bg-white/10" />
          <div className="flex justify-between items-center pt-1">
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="w-6 h-6 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty board ──────────────────────────────────────────────────────────────
function EmptyBoard({ onAddColumn }: { onAddColumn?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-zinc-600"
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
      <div className="text-center">
        <p className="text-zinc-300 font-medium">No columns yet</p>
        <p className="text-zinc-600 text-sm mt-1">
          Add a column to start organizing tasks
        </p>
      </div>
      {onAddColumn && (
        <button
          onClick={onAddColumn}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm
                     font-medium transition-colors"
        >
          Add first column
        </button>
      )}
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────
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
        className="flex items-start gap-4 px-6 pb-6 min-h-full h-full"
        style={{ minWidth: "max-content" }}
      >
        {isLoading ? (
          // Skeleton placeholders while data loads
          <>
            <ColumnSkeleton />
            <ColumnSkeleton />
            <ColumnSkeleton />
          </>
        ) : !hasColumns ? (
          <EmptyBoard onAddColumn={onAddColumn} />
        ) : (
          <>
            {/* Dev 1 injects the real SortableContext + columns here */}
            {children}

            {/* Add column button always at the end */}
            <AddColumnButton onClick={onAddColumn} />
          </>
        )}
      </div>
    </div>
  );
}
