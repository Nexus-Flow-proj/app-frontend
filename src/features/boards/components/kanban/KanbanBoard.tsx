// features/boards/components/KanbanBoard.tsx
// Dev 2 — board container. Dev 1 wraps children with DndContext on merge day.

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import type { BoardState } from "../../types";
import ColumnSkeleton from "../skeletons/ColumnSkeleton";
import EmptyBoard from "../empty-states/EmptyBoard";

interface KanbanBoardProps {
  boardState: BoardState;
  children: ReactNode;
  onAddColumn?: () => void;
  isLoading?: boolean;
}

export function KanbanBoard({
  boardState,
  children,
  onAddColumn,
  isLoading = false,
}: KanbanBoardProps) {
  const hasColumns = boardState.columnOrder.length > 0;

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
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
              className="flex items-center gap-2 w-62 shrink-0 h-fit px-4 py-2.5 rounded-2xl
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
