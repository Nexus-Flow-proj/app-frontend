import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { BoardColumn, TaskDetail } from "../../types";

interface TaskDetailHeaderProps {
  task: TaskDetail;
  columns: BoardColumn[];
  title: string;
  disabled?: boolean;
  onTitleChange: (title: string) => void;
}

export function TaskDetailHeader({
  task,
  columns,
  title,
  disabled = false,
  onTitleChange,
}: TaskDetailHeaderProps) {
  const columnTitle =
    columns.find((column) => column.id === task.boardColumnId)?.name ?? "Board";

  return (
    <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
      <div className="min-w-0 pr-8">
        <p className="text-xs text-muted-foreground mb-1">{columnTitle}</p>
        <SheetTitle className="sr-only">{task.title}</SheetTitle>
        <div className="relative">
          <Pencil className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={title}
            disabled={disabled}
            onChange={(event) => onTitleChange(event.target.value)}
            className="h-9 pl-8 text-sm font-semibold"
            placeholder="Task title"
          />
        </div>
      </div>
    </SheetHeader>
  );
}
