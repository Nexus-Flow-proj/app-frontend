// features/boards/components/TaskCard.tsx
// Dev 2 — styled task card using your CSS variable theme + shadcn Badge.

import { forwardRef } from "react";
import type { CSSProperties } from "react";
import { format, isPast, isToday } from "date-fns";
import { MessageSquare, Paperclip, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "../../../types";
import { PRIORITY_CONFIG } from "../../../constants";
import Avatar from "@/components/shared/MyAvatar";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: CSSProperties;
  dragHandleProps?: Record<string, unknown>;
  onClick?: (task: Task) => void;
}

// ─── Due date badge ───────────────────────────────────────────────────────────
function DueDateBadge({ dueDate }: { dueDate: string }) {
  const date = new Date(dueDate);
  const overdue = isPast(date) && !isToday(date);
  const dueSoon = isToday(date);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded",
        overdue
          ? "bg-destructive/15 text-destructive"
          : dueSoon
            ? "bg-amber-500/15 text-amber-400"
            : "bg-muted text-muted-foreground",
      )}
    >
      <Calendar className="size-3" />
      {overdue ? "Overdue" : isToday(date) ? "Today" : format(date, "MMM d")}
    </span>
  );
}

// ─── Subtask progress bar ─────────────────────────────────────────────────────
function SubtaskProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const done = completed === total && total > 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            done ? "bg-emerald-500" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
        {completed}/{total}
      </span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  (
    {
      task,
      isDragging = false,
      isOverlay = false,
      style,
      dragHandleProps,
      onClick,
    },
    ref,
  ) => {
    const cfg = PRIORITY_CONFIG[task.priority];

    const accentColor =
      task.priority === "urgent"
        ? "hsl(var(--destructive))"
        : task.priority === "high"
          ? "#f97316"
          : task.priority === "medium"
            ? "#f59e0b"
            : "hsl(var(--accent-foreground))";

    return (
      <div
        ref={ref}
        style={style}
        onClick={() => onClick?.(task)}
        className={cn(
          "group relative w-full rounded-xl border bg-card text-left transition-all duration-150 cursor-pointer select-none",
          isDragging
            ? "opacity-40 border-primary/30"
            : isOverlay
              ? "border-primary/50 shadow-xl rotate-1 scale-[1.02]"
              : "border-border hover:border-border/80 hover:bg-card/80",
        )}
        {...dragHandleProps}
      >
        {/* Left accent */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
          style={{ background: accentColor }}
        />

        <div className="px-3 py-3 pl-4 space-y-2">
          {/* Priority + tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide px-2 py-0 gap-1 h-5",
                cfg.bgClass,
                cfg.borderClass,
                cfg.textClass,
              )}
            >
              <span className={cn("size-1.5 rounded-full", cfg.dotClass)} />
              {cfg.label}
            </Badge>
            {task.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] font-normal px-2 py-0 h-5"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <p className="text-[13px] font-medium text-card-foreground leading-snug line-clamp-2">
            {task.title}
          </p>

          {/* Subtask progress */}
          {task.subtaskCount > 0 && (
            <SubtaskProgress
              completed={task.completedSubtaskCount}
              total={task.subtaskCount}
            />
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2.5">
              {task.dueDate && <DueDateBadge dueDate={task.dueDate} />}
              {task.commentCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MessageSquare className="size-3" />
                  {task.commentCount}
                </span>
              )}
              {task.attachmentCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Paperclip className="size-3" />
                  {task.attachmentCount}
                </span>
              )}
            </div>
            {task.assignee && (
              <Avatar
                name={task.assignee.name}
                avatarUrl={task.assignee.avatarUrl}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);
TaskCard.displayName = "TaskCard";
