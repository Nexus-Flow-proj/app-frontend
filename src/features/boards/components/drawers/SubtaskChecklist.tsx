// features/boards/components/SubtaskChecklist.tsx
// Dev 4 — subtask list inside TaskDetailDrawer. Uses shadcn Checkbox.

import { useState, useRef } from "react";
import { Trash2, GripVertical, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HighlightEntity, useHighlightStore } from "@/store/highlight.store";
import type { Subtask, TaskId } from "../../types";

interface SubtaskChecklistProps {
  taskId: TaskId;
  subtasks: Subtask[];
  onToggle: (subtaskId: string, completed: boolean) => void;
  onAdd: (title: string) => void;
  onDelete: (subtaskId: string) => void;
}

function Progress({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const done = completed === total && total > 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right shrink-0">
        {pct}%
      </span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            done ? "bg-emerald-500" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {completed}/{total}
      </span>
    </div>
  );
}

export function SubtaskChecklist({
  subtasks,
  onToggle,
  onAdd,
  onDelete,
}: SubtaskChecklistProps) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const completed = subtasks.filter((s) => s.completed).length;
  const highlightedSubtasks = useHighlightStore(
    state => state.highlighted.get(HighlightEntity.subtask),
  );
  const removingSubtasks = useHighlightStore(
    state => state.removing.get(HighlightEntity.subtask),
  );

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Subtasks
        </p>
        <span className="text-xs text-muted-foreground">
          {completed} of {subtasks.length}
        </span>
      </div>

      {subtasks.length > 0 && (
        <Progress completed={completed} total={subtasks.length} />
      )}

      <div className="space-y-0.5">
        {subtasks.map((subtask) => {
          const highlighted = highlightedSubtasks?.has(subtask.id) ?? false;
          const removing = removingSubtasks?.has(subtask.id) ?? false;

          return (
            <div
              key={subtask.id}
              className={cn(
                "group flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors",
                highlighted && "animate-comment-add",
                removing && "animate-comment-remove",
              )}
            >
              <GripVertical className="size-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 shrink-0 cursor-grab" />
              <Checkbox
                id={subtask.id}
                checked={subtask.completed}
                onCheckedChange={(checked) => onToggle(subtask.id, !!checked)}
                className="shrink-0"
              />
              <label
                htmlFor={subtask.id}
                className={cn(
                  "flex-1 text-sm cursor-pointer leading-snug",
                  subtask.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {subtask.title}
              </label>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive rounded shrink-0"
                onClick={() => onDelete(subtask.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="flex items-center gap-2 mt-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") {
                setAdding(false);
                setValue("");
              }
            }}
            placeholder="Subtask title…"
            className="h-8 text-sm flex-1"
            autoFocus
          />
          <Button size="sm" className="h-8 shrink-0" onClick={submit}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 shrink-0"
            onClick={() => {
              setAdding(false);
              setValue("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full justify-start px-2 -mx-2"
          onClick={() => {
            setAdding(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          <Plus className="size-3.5" /> Add subtask
        </Button>
      )}
    </div>
  );
}
