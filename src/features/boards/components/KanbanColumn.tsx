// features/boards/components/KanbanColumn.tsx
// Dev 2 — shadcn-based column using your CSS variable theme.

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { BoardColumn } from "../types";
import { COLUMN_ACCENT_COLORS, PROTECTED_COLUMNS } from "../constants";

interface KanbanColumnProps {
  column: BoardColumn;
  taskCount: number;
  totalTaskCount?: number; // original count before filtering
  children: ReactNode;
  isOver?: boolean;
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
      totalTaskCount,
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
      column.color ??
      COLUMN_ACCENT_COLORS[column.title] ??
      "hsl(var(--primary))";
    const isProtected = PROTECTED_COLUMNS.includes(column.title);
    const isFiltered =
      totalTaskCount !== undefined && totalTaskCount !== taskCount;

    return (
      <div
        ref={ref}
        style={style}
        className="flex flex-col w-[272px] shrink-0 rounded-2xl bg-card border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="px-3.5 pt-3.5 pb-2.5">
          {/* Accent line */}
          <div
            className="h-0.5 w-7 rounded-full mb-3 opacity-90"
            style={{ background: accentColor }}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-[13px] font-semibold text-card-foreground truncate">
                {column.title}
              </h3>
              <span className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground shrink-0">
                {isFiltered ? `${taskCount}/${totalTaskCount}` : taskCount}
              </span>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => onAddTask?.(column.id)}
              >
                <Plus className="size-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {!isProtected ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => onRenameColumn?.(column.id)}
                      >
                        Rename column
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => onDeleteColumn?.(column.id)}
                      >
                        Delete column
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      disabled
                      className="text-muted-foreground"
                    >
                      Protected column
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={cn(
            "flex-1 flex flex-col gap-2 px-2.5 pb-2.5 overflow-y-auto transition-colors duration-150 min-h-[80px]",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/30",
            isOver && "bg-primary/[0.03]",
          )}
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {children}

          {isOver && taskCount === 0 && (
            <div className="flex-1 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center min-h-[60px]">
              <p className="text-xs text-primary/40">Drop here</p>
            </div>
          )}
        </div>

        {/* Add task footer */}
        <div className="px-2.5 pb-2.5 pt-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg border border-transparent hover:border-border"
            onClick={() => onAddTask?.(column.id)}
          >
            <Plus className="size-3.5" />
            Add task
          </Button>
        </div>
      </div>
    );
  },
);
KanbanColumn.displayName = "KanbanColumn";
