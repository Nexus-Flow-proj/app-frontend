// features/boards/components/TaskDetailDrawer.tsx
// Dev 4 — slide-out drawer using shadcn Sheet.

import { format } from "date-fns";
import { ArrowRight, Tag, Calendar, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SubtaskChecklist } from "./SubtaskChecklist";
import { CommentThread } from "./CommentThread";
import { PRIORITY_CONFIG } from "../constants";
import type { TaskDetail, Priority, BoardMember, BoardColumn } from "../types";

interface TaskDetailDrawerProps {
  task: TaskDetail | null;
  columns: BoardColumn[];
  members: BoardMember[];
  currentUser: BoardMember;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onUpdatePriority: (taskId: string, priority: Priority) => void;
  onUpdateAssignee: (taskId: string, assigneeId: string | null) => void;
  onUpdateDueDate: (taskId: string, dueDate: string | null) => void;
  onMoveToColumn: (taskId: string, columnId: string) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onAddSubtask: (title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddComment: (content: string) => void;
  isSubmittingComment?: boolean;
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 min-h-[34px]">
      <div className="flex items-center gap-2 w-24 shrink-0 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 mt-4 px-6 animate-pulse">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-px w-full my-3" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="flex-1 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function TaskDetailDrawer({
  task,
  columns,
  members,
  currentUser,
  isOpen,
  isLoading = false,
  onClose,
  onUpdatePriority,
  onUpdateAssignee,
  onUpdateDueDate,
  onMoveToColumn,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onAddComment,
  isSubmittingComment,
}: TaskDetailDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[500px] p-0 flex flex-col gap-0 overflow-hidden"
      >
        {isLoading || !task ? (
          <div className="pt-8">
            <DrawerSkeleton />
          </div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
              <p className="text-xs text-muted-foreground mb-1">
                {columns.find((c) => c.id === task.columnId)?.title ?? "Board"}
              </p>
              <SheetTitle className="text-base font-semibold text-left leading-snug">
                {task.title}
              </SheetTitle>
              {task.description && (
                <p className="text-sm text-muted-foreground leading-relaxed text-left mt-1">
                  {task.description}
                </p>
              )}
            </SheetHeader>

            {/* Scrollable body */}
            <div
              className="flex-1 overflow-y-auto px-6 pb-8 space-y-5
                            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/30"
            >
              {/* Meta */}
              <div className="pt-4 space-y-1">
                <MetaRow
                  icon={<span className="text-xs">⚡</span>}
                  label="Priority"
                >
                  <Select
                    value={task.priority}
                    onValueChange={(v) =>
                      onUpdatePriority(task.id, v as Priority)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["urgent", "high", "medium", "low"] as Priority[]).map(
                        (p) => {
                          const cfg = PRIORITY_CONFIG[p];
                          return (
                            <SelectItem key={p} value={p} className="text-sm">
                              <span className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "size-2 rounded-full",
                                    cfg.dotClass,
                                  )}
                                />
                                {cfg.label}
                              </span>
                            </SelectItem>
                          );
                        },
                      )}
                    </SelectContent>
                  </Select>
                </MetaRow>

                <MetaRow icon={<User className="size-3.5" />} label="Assignee">
                  <Select
                    value={task.assignee?.id ?? "unassigned"}
                    onValueChange={(v) =>
                      onUpdateAssignee(task.id, v === "unassigned" ? null : v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="unassigned"
                        className="text-sm text-muted-foreground"
                      >
                        Unassigned
                      </SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-sm">
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MetaRow>

                <MetaRow
                  icon={<Calendar className="size-3.5" />}
                  label="Due date"
                >
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                    onChange={(e) =>
                      onUpdateDueDate(task.id, e.target.value || null)
                    }
                    className="h-8 px-3 rounded-md bg-background border border-input text-xs text-foreground
                               focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark] transition-colors w-full"
                  />
                </MetaRow>

                <MetaRow
                  icon={<ArrowRight className="size-3.5" />}
                  label="Move to"
                >
                  <Select
                    value={task.columnId}
                    onValueChange={(v) => onMoveToColumn(task.id, v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem
                          key={col.id}
                          value={col.id}
                          className="text-sm"
                        >
                          {col.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MetaRow>

                {task.tags.length > 0 && (
                  <MetaRow icon={<Tag className="size-3.5" />} label="Tags">
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </MetaRow>
                )}
              </div>

              {/* Subtasks */}
              <div className="border-t border-border pt-4">
                <SubtaskChecklist
                  taskId={task.id}
                  subtasks={task.subtasks}
                  onToggle={onToggleSubtask}
                  onAdd={onAddSubtask}
                  onDelete={onDeleteSubtask}
                />
              </div>

              {/* Comments */}
              <div className="border-t border-border pt-4">
                <CommentThread
                  comments={task.comments}
                  currentUser={currentUser}
                  onAddComment={onAddComment}
                  isSubmitting={isSubmittingComment}
                />
              </div>

              {/* Activity log */}
              {task.activityLog.length > 0 && (
                <div className="border-t border-border pt-4 space-y-2.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Activity
                  </p>
                  {task.activityLog.map((event) => (
                    <div key={event.id} className="flex items-start gap-2.5">
                      <div className="size-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                      <div>
                        <span className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {event.actor.name}
                          </span>{" "}
                          {event.action}
                        </span>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          {format(
                            new Date(event.createdAt),
                            "MMM d 'at' h:mm a",
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
