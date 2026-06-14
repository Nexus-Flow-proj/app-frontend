// features/boards/components/KanbanColumn.tsx
// Dev 2 — styled column wrapper. Dev 1 wraps this with useDroppable.

import { forwardRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { BoardColumn } from "../types/types.index (1)";
import {
  COLUMN_ACCENT_COLORS,
  PROTECTED_COLUMNS,
} from "../constants/constants.index";

interface KanbanColumnProps {
  column: BoardColumn;
  taskCount: number;
  children: ReactNode;
  isOver?: boolean; // dnd-kit: a draggable is hovering over this column
  style?: CSSProperties;
  onAddTask?: (columnId: string) => void;
  onRenameColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export const KanbanColumn = forwardRef<HTMLDivElement, KanbanColumnProps>(
  (
    {
      column,
      taskCount,
      children,
      isOver = false,
      style,
      onAddTask,
      onRenameColumn,
      onDeleteColumn,
    },
    ref,
  ) => {
    const accentColor =
      column.color ?? COLUMN_ACCENT_COLORS[column.title] ?? "#6366f1";
    const isProtected = PROTECTED_COLUMNS.includes(column.title);

    return (
      <div
        ref={ref}
        style={style}
        className="flex flex-col w-[300px] shrink-0 rounded-2xl bg-[#14141f] border border-white/[0.06] overflow-hidden"
      >
        {/* Column header */}
        <div className="px-4 pt-4 pb-3">
          {/* Accent line */}
          <div
            className="h-[2px] w-8 rounded-full mb-3 opacity-80"
            style={{ background: accentColor }}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <h3 className="text-sm font-semibold text-zinc-100 truncate">
                {column.title}
              </h3>
              <span
                className="text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-full min-w-[22px]
                           text-center text-zinc-400 bg-white/[0.07] border border-white/[0.08]"
              >
                {taskCount}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-zinc-500 hover:text-zinc-200 hover:bg-white/10 rounded-lg"
                onClick={() => onAddTask?.(column.id)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-zinc-500 hover:text-zinc-200 hover:bg-white/10 rounded-lg"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-[#1c1c28] border-white/10"
                >
                  {!isProtected && (
                    <>
                      <DropdownMenuItem
                        className="text-zinc-300 focus:text-white focus:bg-white/10 text-sm"
                        onClick={() => onRenameColumn?.(column.id)}
                      >
                        Rename column
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-300 focus:bg-red-500/10 text-sm"
                        onClick={() => onDeleteColumn?.(column.id)}
                      >
                        Delete column
                      </DropdownMenuItem>
                    </>
                  )}
                  {isProtected && (
                    <DropdownMenuItem
                      disabled
                      className="text-zinc-600 text-sm cursor-not-allowed"
                    >
                      Protected column
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Drop zone — cards list */}
        <div
          className={`
            flex-1 flex flex-col gap-2.5 px-3 pb-3 overflow-y-auto
            transition-colors duration-150 min-h-[120px]
            ${isOver ? "bg-indigo-500/[0.04]" : ""}
          `}
          style={{ maxHeight: "calc(100vh - 220px)" }}
        >
          {children}

          {/* Drop indicator at bottom when hovering with no cards */}
          {isOver && taskCount === 0 && (
            <div className="flex-1 rounded-xl border-2 border-dashed border-indigo-500/30 flex items-center justify-center min-h-[80px]">
              <p className="text-xs text-indigo-400/60">Drop here</p>
            </div>
          )}
        </div>

        {/* Add task footer button */}
        <div className="px-3 pb-3 pt-1">
          <button
            onClick={() => onAddTask?.(column.id)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-500
                       hover:text-zinc-300 hover:bg-white/[0.05] transition-all duration-150
                       text-sm border border-transparent hover:border-white/[0.07]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add task
          </button>
        </div>
      </div>
    );
  },
);

KanbanColumn.displayName = "KanbanColumn";
