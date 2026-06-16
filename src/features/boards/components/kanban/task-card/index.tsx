import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { Task } from "../../../types";
import SubtaskProgress from "./SubtaskProgress";
import TaskCardFooter from "./TaskCardFooter";
import TaskCardTags from "./TaskCardTags";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: CSSProperties;
  dragHandleProps?: Record<string, unknown>;
  onClick?: (task: Task) => void;
}

function TaskCard({
  task,
  isDragging = false,
  isOverlay = false,
  style,
  onClick,
}: TaskCardProps) {
  const accentColor =
    task.priority === "urgent"
      ? "var(--destructive)"
      : task.priority === "high"
        ? "#f97316"
        : task.priority === "medium"
          ? "#f59e0b"
          : "var(--accent-foreground)";

  return (
    <div
      style={style}
      onClick={() => onClick?.(task)}
      className={cn(
        "group relative w-full rounded-lg border bg-card hover:bg-card/20 text-left transition-all duration-150 cursor-pointer select-none",
        isDragging
          ? "opacity-40 border-primary/30"
          : isOverlay
            ? "border-primary/50 shadow-xl rotate-1 scale-[1.02]"
            : "border-border hover:border-border/80 hover:bg-card/80",
      )}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full"
        style={{ background: accentColor }}
      />

      <div className="px-3 py-3 pl-4 space-y-2">
        <TaskCardTags priority={task.priority} tags={task.tags} />

        <p className="text-[13px] font-medium text-card-foreground leading-snug line-clamp-2">
          {task.title}
        </p>

        {task.subtaskCount > 0 && (
          <SubtaskProgress
            completed={task.completedSubtaskCount}
            total={task.subtaskCount}
          />
        )}

        <TaskCardFooter
          dueDate={task.dueDate}
          commentCount={task.commentCount}
          attachmentCount={task.attachmentCount}
          assignee={task.assignee}
        />
      </div>
    </div>
  );
}
export default TaskCard;
