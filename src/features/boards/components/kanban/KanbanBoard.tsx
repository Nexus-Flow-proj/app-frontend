// features/boards/components/KanbanBoard.tsx
// Dev 2 — board container. Dev 1 wraps children with DndContext on merge day.

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import type { BoardState } from "../../types";
import ColumnSkeleton from "../skeletons/ColumnSkeleton";
import EmptyBoard from "../empty-states/EmptyBoard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
            <Button
              variant="dashed"
              size="lg"
              onClick={onAddColumn}
              className="w-62 shrink-0"
            >
              <Badge variant="secondary" size="sm" shape="rounded">
                <Plus />
              </Badge>
              Add column
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
