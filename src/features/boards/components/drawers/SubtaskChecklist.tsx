// features/boards/components/SubtaskChecklist.tsx
// Dev 4 — subtask list inside TaskDetailDrawer. Uses shadcn Checkbox.

import { useState, useRef } from "react";
import { Trash2, GripVertical, Plus, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { HighlightEntity, useHighlightStore } from "@/store/highlight.store";
import type { Subtask } from "../../types";

interface SubtaskChecklistProps {
  subtasks: Subtask[];
  disabled?: boolean;
  isGeneratingBreakdown?: boolean;
  onToggle: (subtaskId: string, completed: boolean) => void;
  onTitleChange: (subtaskId: string, title: string) => void;
  onAdd: (title: string) => void;
  onGenerateAiBreakdown?: () => void;
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
  disabled,
  isGeneratingBreakdown,
  onToggle,
  onTitleChange,
  onAdd,
  onGenerateAiBreakdown,
  onDelete,
}: SubtaskChecklistProps) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const completed = subtasks.filter((s) => s.completed).length;
  const highlightedSubtasks = useHighlightStore((state) =>
    state.highlighted.get(HighlightEntity.subtask),
  );
  const removingSubtasks = useHighlightStore((state) =>
    state.removing.get(HighlightEntity.subtask),
  );

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
    setAdding(false);
  };

  const startAdding = () => {
    setAdding(true);
    setTimeout(() => inputRef.current?.focus(), 50);
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

      <div className="flex flex-wrap justify-between items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={startAdding}
          disabled={disabled || adding}
        >
          <Plus className="size-3.5" />
          Add subtask
        </Button>
        <Button
          type="button"
          variant="soft"
          size="sm"
          className="h-8 gap-1.5 text-primary"
          disabled={disabled || !onGenerateAiBreakdown}
          isLoading={isGeneratingBreakdown}
          onClick={onGenerateAiBreakdown}
        >
          <Sparkles className="size-3.5" />
          Break down with AI
        </Button>
      </div>

      <div className="space-y-0.5">
        {subtasks.map((subtask) => {
          const highlighted = highlightedSubtasks?.has(subtask.id) ?? false;
          const removing = removingSubtasks?.has(subtask.id) ?? false;

          return (
            <div
              key={subtask.id}
              className={cn(
                "group flex items-start gap-2.5 py-1.5 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors",
                highlighted && "animate-comment-add",
                removing && "animate-comment-remove",
              )}
            >
              <GripVertical className="mt-2 size-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 shrink-0 cursor-grab" />
              <Checkbox
                id={subtask.id}
                checked={subtask.completed}
                disabled={disabled}
                onCheckedChange={(checked) => onToggle(subtask.id, !!checked)}
                className="mt-2 shrink-0"
              />
              <Textarea
                value={subtask.title}
                disabled={disabled}
                onChange={(event) =>
                  onTitleChange(subtask.id, event.target.value)
                }
                className={cn(
                  "min-h-8 flex-1 resize-none overflow-hidden border-transparent bg-transparent px-1 py-1 text-sm shadow-none focus-visible:border-input",
                  subtask.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground",
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-1.5 size-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive rounded shrink-0"
                disabled={disabled}
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
            disabled={disabled}
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
          <Button
            size="sm"
            className="h-8 shrink-0"
            disabled={disabled}
            onClick={submit}
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 shrink-0"
            disabled={disabled}
            onClick={() => {
              setAdding(false);
              setValue("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  );
}
