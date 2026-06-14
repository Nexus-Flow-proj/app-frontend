// features/boards/components/TaskCard.tsx
// Dev 2 — pixel-perfect styled card. Receives drag handle props from Dev 1's useSortable.

import { forwardRef } from "react";
import type { CSSProperties } from "react";
import { format, isPast, isToday } from "date-fns";
import { MessageSquare, Paperclip, CheckSquare, Calendar } from "lucide-react";
import type { Task } from "../types/types.index (1)";
import { PRIORITY_CONFIG } from "../constants/constants.index";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean; // true when rendered inside DragOverlay (floating ghost)
  style?: CSSProperties;
  dragHandleProps?: Record<string, unknown>;
  onClick?: (task: Task) => void;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        title={name}
        className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10"
      />
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      title={name}
      className="w-6 h-6 rounded-full bg-indigo-500/30 ring-1 ring-indigo-400/40
                 flex items-center justify-center text-[10px] font-semibold text-indigo-300 shrink-0"
    >
      {initials}
    </div>
  );
}

// ─── Due date badge ───────────────────────────────────────────────────────────
function DueDateBadge({ dueDate }: { dueDate: string }) {
  const date = new Date(dueDate);
  const overdue = isPast(date) && !isToday(date);
  const dueSoon = isToday(date);

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded
        ${
          overdue
            ? "bg-red-500/20 text-red-400"
            : dueSoon
              ? "bg-amber-500/20 text-amber-400"
              : "bg-white/5 text-zinc-400"
        }`}
    >
      <Calendar className="w-3 h-3" />
      {format(date, "MMM d")}
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
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-400 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-zinc-500 tabular-nums shrink-0">
        {completed}/{total}
      </span>
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────
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
    const priority = PRIORITY_CONFIG[task.priority];

    const accentColor =
      task.priority === "urgent"
        ? "#f87171"
        : task.priority === "high"
          ? "#fb923c"
          : task.priority === "medium"
            ? "#facc15"
            : "#38bdf8";

    return (
      <div
        ref={ref}
        style={style}
        onClick={() => onClick?.(task)}
        className={`
          group relative w-full rounded-xl border bg-[#1c1c28] text-left
          transition-all duration-150 cursor-pointer select-none
          ${
            isDragging
              ? "opacity-40 border-indigo-500/40 shadow-none"
              : isOverlay
                ? "border-indigo-400/50 shadow-2xl shadow-black/60 rotate-1 scale-[1.02]"
                : "border-white/[0.07] hover:border-white/[0.14] hover:bg-[#1f1f2e] shadow-sm hover:shadow-md"
          }
        `}
        {...dragHandleProps}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{ background: accentColor }}
        />

        <div className="px-4 py-3 pl-5 space-y-2.5">
          {/* Priority badge + tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase
                          tracking-wide px-2 py-0.5 rounded-full border
                          ${priority.bg} ${priority.border} ${priority.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-zinc-400 bg-white/5 border border-white/10
                           px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-zinc-100 leading-snug line-clamp-2 group-hover:text-white transition-colors">
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
            <div className="flex items-center gap-3">
              {task.dueDate && <DueDateBadge dueDate={task.dueDate} />}
              {task.commentCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <MessageSquare className="w-3 h-3" />
                  {task.commentCount}
                </span>
              )}
              {task.attachmentCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <Paperclip className="w-3 h-3" />
                  {task.attachmentCount}
                </span>
              )}
              {task.subtaskCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <CheckSquare className="w-3 h-3" />
                  {task.completedSubtaskCount}/{task.subtaskCount}
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
