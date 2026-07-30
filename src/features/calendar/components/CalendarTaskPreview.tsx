import {
  CalendarClockIcon,
  CheckCircle2Icon,
  MessageSquareTextIcon,
  MousePointerClickIcon,
  PaperclipIcon,
  TagIcon,
  UserRoundIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/features/boards/constants";
import type { Task } from "@/features/boards/types";
import { CALENDAR_PRIORITY_PANEL_CLASS_NAMES } from "../constants";

interface CalendarTaskPreviewProps {
  task: Task | null;
}

export function CalendarTaskPreview({ task }: CalendarTaskPreviewProps) {
  if (!task) {
    return (
      <aside className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="bg-linear-to-br from-primary/14 via-primary/5 to-transparent p-5">
          <div className="flex size-10 items-center justify-center rounded-lg border bg-background/70 text-primary shadow-sm">
            <MousePointerClickIcon className="size-5" />
          </div>
          <p className="mt-4 text-base font-semibold">Task preview</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Select a calendar task to inspect its status, priority, and assignee.
          </p>
        </div>
      </aside>
    );
  }

  const completionPercent =
    task.subtasksCount && task.subtasksCount > 0
      ? Math.round(
          ((task.completedSubtasksCount ?? 0) / task.subtasksCount) * 100,
        )
      : 0;
  const statusConfig = STATUS_CONFIG[task.status];
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <aside className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div
        className={cn(
          "bg-linear-to-br p-5",
          CALENDAR_PRIORITY_PANEL_CLASS_NAMES[task.priority],
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Selected task
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-7">
              {task.title}
            </h2>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "h-5 shrink-0 gap-1 font-semibold uppercase tracking-wide",
              priorityConfig.bgClass,
              priorityConfig.borderClass,
              priorityConfig.textClass,
            )}
          >
            <span
              className={cn("size-1.5 rounded-full", priorityConfig.dotClass)}
            />
            {priorityConfig.label}
          </Badge>
        </div>

        {task.description && (
          <p className="mt-4 line-clamp-5 rounded-lg border bg-background/55 p-3 text-sm leading-6 text-muted-foreground">
            {task.description}
          </p>
        )}
      </div>

      <div className="p-5 pt-4">
        <dl className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/35 px-3 py-2.5">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <TagIcon className="size-4" />
              Status
            </dt>
            <dd className="flex items-center gap-2 font-semibold">
              <span className={cn("size-2 rounded-full", statusConfig.dotClass)} />
              {statusConfig.label}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/35 px-3 py-2.5">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <CalendarClockIcon className="size-4" />
              Due date
            </dt>
            <dd className="font-semibold">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/35 px-3 py-2.5">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <UserRoundIcon className="size-4" />
              Assignee
            </dt>
            <dd className="max-w-36 truncate font-semibold">
              {task.assignee?.name ?? "Unassigned"}
            </dd>
          </div>
        </dl>

        <Separator className="my-4" />

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border bg-background/60 p-3">
            <CheckCircle2Icon className="size-4 text-emerald-500" />
            <p className="mt-2 text-lg font-semibold tabular-nums">
              {completionPercent}%
            </p>
            <p className="text-xs text-muted-foreground">Subtasks</p>
          </div>
          <div className="rounded-lg border bg-background/60 p-3">
            <MessageSquareTextIcon className="size-4 text-primary" />
            <p className="mt-2 text-lg font-semibold tabular-nums">
              {task.commentsCount ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>
          <div className="rounded-lg border bg-background/60 p-3">
            <PaperclipIcon className="size-4 text-amber-500" />
            <p className="mt-2 text-lg font-semibold tabular-nums">
              {task.attachmentsCount ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Files</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
