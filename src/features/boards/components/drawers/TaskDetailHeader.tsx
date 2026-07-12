import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { BoardColumn, TaskDetail } from "../../types";

interface TaskDetailHeaderProps {
  task: TaskDetail;
  columns: BoardColumn[];
  onUpdateTitle: (taskId: string, title: string) => void;
  isUpdating?: boolean;
}

export function TaskDetailHeader({
  task,
  columns,
  onUpdateTitle,
  isUpdating = false,
}: TaskDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const columnTitle =
    columns.find((column) => column.id === task.boardColumnId)?.name ?? "Board";

  const submit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle === task.title || isUpdating) {
      setIsEditing(false);
      setTitle(task.title);
      return;
    }

    onUpdateTitle(task.id, trimmedTitle);
    setIsEditing(false);
  };

  return (
    <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
      <div className="min-w-0 pr-8">
        <p className="text-xs text-muted-foreground mb-1">{columnTitle}</p>
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submit();
                }

                if (event.key === "Escape") {
                  setIsEditing(false);
                  setTitle(task.title);
                }
              }}
              className="h-8 text-sm font-semibold"
              autoFocus
            />
            <Button
              type="button"
              size="icon"
              className="size-8 shrink-0"
              disabled={!title.trim() || isUpdating}
              onClick={submit}
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => {
                setIsEditing(false);
                setTitle(task.title);
              }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-1.5">
            <SheetTitle className="min-w-0 flex-1 text-base font-semibold text-left leading-snug">
              {task.title}
            </SheetTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground"
              onClick={() => {
                setTitle(task.title);
                setIsEditing(true);
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </SheetHeader>
  );
}
