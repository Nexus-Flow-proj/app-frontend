import { FolderX, Plus } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  useFilteredTasks,
} from "../../../hooks/useBoardFilters";
import { useSortableColumn } from "../../../hooks/useSortableColumn";
import type { BoardState, Task } from "../../../types";
import KanbanColumnActionsMenu from "./ColumnActionsMenu";
import TaskCard from "../task-card";
import { MyEmpty } from "@/components/shared/feedback/MyEmpty";

interface KanbanBoardColumnProps {
  columnId: string;
  boardState: BoardState;
  onCardClick: (task: Task) => void;
  currentUserId: string;

  onAddTask: (columnId: string) => void;
  onRenameColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  isOver?: boolean;
}

function KanbanBoardColumn({
  columnId,
  boardState,
  onCardClick,
  currentUserId,
  onAddTask,
  onRenameColumn = (id) => console.log("rename", id),
  onDeleteColumn = (id) => console.log("delete", id),
  isOver = false,
}: KanbanBoardColumnProps) {
  const column = boardState.columns[columnId];
  const tasks = boardState.tasks[columnId] ?? [];
  const filters = useUrlFilters();
  const filteredTasks = useFilteredTasks(tasks, currentUserId);
  const { attributes, listeners, setNodeRef, style } = useSortableColumn(column);

  const accentColor =
    column.color ?? COLUMN_ACCENT_COLORS[column.name] ?? "var(--primary)";
  const isProtected =
    column.isProtected || PROTECTED_COLUMNS.includes(column.name);
  const isFiltered = tasks.length !== filteredTasks.length;
  const hasActiveFilters = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length : value,
  );

  return (
    <Card ref={setNodeRef} style={style} className="w-68">
      <CardHeader
        className="gap-0 pt-3 pb-2 px-3 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="min-w-0">
          <div
            className="h-0.5 w-7 rounded-full mb-3 opacity-90"
            style={{ background: accentColor }}
          />
          <div className="flex items-center gap-2 min-w-0">
            <CardTitle className="text-[14px] font-semibold truncate">
              {column.name}
            </CardTitle>
            <Badge
              variant="outline"
              size="sm"
              shape="rounded"
              className="font-semibold tabular-nums"
            >
              {isFiltered
                ? `${filteredTasks.length}/${tasks.length}`
                : filteredTasks.length}
            </Badge>
          </div>
        </div>

        <CardAction>
          <KanbanColumnActionsMenu
            columnId={column.id}
            isProtected={isProtected}
            onAddTask={() => onAddTask(columnId)}
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
        {filteredTasks.length === 0 ? (
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
          <SortableContext
            items={filteredTasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={onCardClick} />
            ))}
          </SortableContext>
        )}

        {isOver && filteredTasks.length === 0 && (
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
          onClick={() => onAddTask(columnId)}
        >
          <Plus />
          Add task
        </Button>
      </CardFooter>
    </Card>
  );
}

export default KanbanBoardColumn;
