import { FolderX, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { COLUMN_ACCENT_COLORS, PROTECTED_COLUMNS } from "../../../constants";
import {
  useUrlFilters,
  useFilteredTaskIds,
} from "../../../hooks/useBoardFilters";
import type { BoardState, Task } from "../../../types";
import { CURRENT_USER } from "../../../data/mock-data";
import KanbanColumnActionsMenu from "./ColumnActionsMenu";
import TaskCard from "../task-card";
import { MyEmpty } from "@/components/shared/feedback/MyEmpty";

interface KanbanBoardColumnProps {
  columnId: string;
  boardState: BoardState;
  onCardClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  onRenameColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  isOver?: boolean;
}

function KanbanBoardColumn({
  columnId,
  boardState,
  onCardClick,
  onAddTask,
  onRenameColumn = (id) => console.log("rename", id),
  onDeleteColumn = (id) => console.log("delete", id),
  isOver = false,
}: KanbanBoardColumnProps) {
  const column = boardState.columns[columnId];
  const filters = useUrlFilters();
  const filteredIds = useFilteredTaskIds(
    column.taskIds,
    boardState.tasks,
    CURRENT_USER.id,
  );

  const accentColor =
    column.color ?? COLUMN_ACCENT_COLORS[column.title] ?? "var(--primary)";
  const isProtected = PROTECTED_COLUMNS.includes(column.title);
  const isFiltered = column.taskIds.length !== filteredIds.length;
  const hasActiveFilters = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length : value,
  );

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
              variant="outline"
              size="sm"
              shape="rounded"
              className="font-semibold tabular-nums"
            >
              {isFiltered
                ? `${filteredIds.length}/${column.taskIds.length}`
                : filteredIds.length}
            </Badge>
          </div>
        </div>

        <CardAction>
          <KanbanColumnActionsMenu
            columnId={column.id}
            isProtected={isProtected}
            onRenameColumn={onRenameColumn}
            onDeleteColumn={onDeleteColumn}
          />
        </CardAction>
      </CardHeader>

      <CardContent
        className={cn(
          "flex-1 min-h-0 flex flex-col gap-2 px-3 overflow-y-auto transition-colors duration-150",
          "custom-scrollbar",
          isOver && "bg-primary/3",
        )}
      >
        {filteredIds.length === 0 ? (
          hasActiveFilters ? (
            <MyEmpty
              title="No tasks match filters"
              description="Try adjusting your filters to see more tasks"
              icon={FolderX}
            />
          ) : (
            <MyEmpty
              title="No tasks yet"
              description="Add a task to get started"
              icon={FolderX}
            />
          )
        ) : (
          filteredIds.map((taskId) => {
            const task = boardState.tasks[taskId];
            if (!task) return null;
            return <TaskCard key={task.id} task={task} onClick={onCardClick} />;
          })
        )}

        {isOver && filteredIds.length === 0 && (
          <div className="flex-1 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center min-h-15">
            <p className="text-xs text-primary/40">Drop here</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t-0 bg-transparent px-3 pt-2 pb-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          onClick={() => onAddTask(column.id)}
        >
          <Plus />
          Add task
        </Button>
      </CardFooter>
    </Card>
  );
}

export default KanbanBoardColumn;
