import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import type { BoardState } from "../../types";
import EmptyBoard from "../empty-states/EmptyBoard";
import { Button } from "@/components/ui/button";
import BoardSkeleton from "../skeletons/BoardSkeleton";

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
        className="flex items-start gap-4 px-5 pb-5 pt-4 h-full"
        style={{ minWidth: "max-content" }}
      >
        {isLoading ? (
          <BoardSkeleton />
        ) : !hasColumns ? (
          <EmptyBoard onAddColumn={onAddColumn} />
        ) : (
          <>
            <SortableContext
              items={boardState.columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              {children}
            </SortableContext>
            <Button
              variant="dashed"
              size="lg"
              onClick={onAddColumn}
              className="w-62 shrink-0"
            >
              <Plus />
              Add column
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
