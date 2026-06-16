// features/boards/components/KanbanColumn.tsx
// Dev 2 — shadcn-based column using your CSS variable theme.

import { type ReactNode } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { BoardColumn } from "../../types";
import { COLUMN_ACCENT_COLORS, PROTECTED_COLUMNS } from "../../constants";
import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  column: BoardColumn;
  taskCount: number;
  totalTaskCount?: number; // original count before filtering
  children: ReactNode;
  isOver?: boolean;
  onAddTask?: (columnId: string) => void;
  onRenameColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export function KanbanColumn({
  column,
  taskCount,
  totalTaskCount,
  children,
  isOver = false,
  onAddTask,
  onRenameColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const accentColor =
    column.color ?? COLUMN_ACCENT_COLORS[column.title] ?? "hsl(var(--primary))";
  const isProtected = PROTECTED_COLUMNS.includes(column.title);
  const isFiltered =
    totalTaskCount !== undefined && totalTaskCount !== taskCount;

  return (
    <Card className="h-full w-68">
      <CardHeader className="gap-0 pt-3 pb-2 px-3">
        <div className="min-w-0">
          <div
            className="h-0.5 w-7 rounded-full mb-3 opacity-90"
            style={{ background: accentColor }}
          />

          <div className="flex items-center gap-2 min-w-0">
            <CardTitle className="text-[14px] font-semibold truncate">
              {column.title}
            </CardTitle>
            <Badge
              variant={"outline"}
              className="text-[10px] font-semibold tabular-nums "
            >
              {isFiltered ? `${taskCount}/${totalTaskCount}` : taskCount}
            </Badge>
          </div>
        </div>

        <CardAction className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onAddTask?.(column.id)}
          >
            <Plus />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {!isProtected ? (
                <>
                  <DropdownMenuItem onClick={() => onRenameColumn?.(column.id)}>
                    Rename column
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDeleteColumn?.(column.id)}
                  >
                    Delete column
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  Protected column
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent
        className={cn(
          "flex-1 min-h-0 flex flex-col gap-2 px-3 overflow-y-auto transition-colors duration-150",
          "custom-scrollbar",
          isOver && "bg-primary/3",
        )}
      >
        {children}

        {isOver && taskCount === 0 && (
          <div className="flex-1 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center min-h-15">
            <p className="text-xs text-primary/40">Drop here</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t-0 bg-transparent px-3 pt-2 pb-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:border-border"
          onClick={() => onAddTask?.(column.id)}
        >
          <Plus />
          Add task
        </Button>
      </CardFooter>
    </Card>
  );
}
