import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { Task } from "../../../types";
import SubtaskProgress from "./SubtaskProgress";
import TaskCardFooter from "./TaskCardFooter";
import TaskCardTags from "./TaskCardTags";
import { TaskPriority } from "../../../types/enums";
import { useSortableTask } from "../../../hooks/useSortableTask";

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
  const {
    attributes,
    isDragging: isSortableDragging,
    listeners,
    setNodeRef,
    style: sortableStyle,
  } = useSortableTask(task);
  const accentColor =
    task.priority === TaskPriority.URGENT
      ? "var(--destructive)"
      : task.priority === TaskPriority.HIGH
        ? "var(--chart-5)"
        : task.priority === TaskPriority.MEDIUM
          ? "var(--chart-4)"
          : "var(--accent-foreground)";

  return (
    <div
      ref={setNodeRef}
      style={{ ...sortableStyle, ...style }}
      onClick={() => onClick?.(task)}
      className={cn(
        "group relative w-full rounded-lg border bg-background/30 text-left transition-all duration-150 cursor-pointer select-none",
        isDragging || isSortableDragging
          ? "opacity-40 border-primary/30"
          : isOverlay
            ? "border-primary/50 shadow-xl rotate-1 scale-[1.02]"
            : "border-border hover:border-dashed hover:bg-background/70",
      )}
      {...attributes}
      {...listeners}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full"
        style={{ background: accentColor }}
      />

      <div className="px-3 py-3 pl-4 space-y-2">
        <TaskCardTags priority={task.priority} tags={task.tags ?? []} />

        <p className="text-[13px] font-medium text-card-foreground leading-snug line-clamp-2">
          {task.title}
        </p>

        {!!task.subtaskCount && task.subtaskCount > 0 && (
          <SubtaskProgress
            completed={task.completedSubtaskCount ?? 0}
            total={task.subtaskCount}
          />
        )}

        <TaskCardFooter
          dueDate={task.dueDate}
          commentCount={task.commentCount ?? 0}
          attachmentCount={task.attachmentCount ?? 0}
          assignee={task.assignee ?? null}
        />
      </div>
    </div>
  );
}
export default TaskCard;
