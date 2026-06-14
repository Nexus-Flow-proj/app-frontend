// features/boards/components/TaskDetailDrawer.tsx
// Dev 4 — slide-out drawer when a task card is clicked.
// Plugs into Dev 2's TaskCard onClick prop.

import { format } from "date-fns";
import { X, Calendar, User, Tag, ArrowRight, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SubtaskChecklist } from "./SubtaskChecklist";
import { CommentThread } from "./CommentThread";
import type {
  TaskDetail,
  Priority,
  BoardMember,
  BoardColumn,
} from "../types/types.index (1)";
import { PRIORITY_CONFIG } from "../constants/constants.index";

interface TaskDetailDrawerProps {
  task: TaskDetail | null;
  columns: BoardColumn[];
  members: BoardMember[];
  currentUser: BoardMember;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  // Task actions — hooked up to Dev 3's mutation hooks
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

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="h-px bg-white/[0.06]" />
      <div>{children}</div>
    </div>
  );
}

// ─── Meta row ─────────────────────────────────────────────────────────────────
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
    <div className="flex items-center gap-3 min-h-[36px]">
      <div className="flex items-center gap-2 w-28 shrink-0">
        <span className="text-zinc-600">{icon}</span>
        <span className="text-xs text-zinc-500 font-medium">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function DrawerSkeleton() {
  return (
    <div className="space-y-4 mt-4 animate-pulse">
      <div className="h-6 w-3/4 bg-white/10 rounded" />
      <div className="h-4 w-full bg-white/10 rounded" />
      <div className="h-4 w-5/6 bg-white/10 rounded" />
      <div className="h-px bg-white/10 my-4" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-28 h-4 bg-white/10 rounded" />
          <div className="flex-1 h-8 bg-white/10 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Main drawer ──────────────────────────────────────────────────────────────
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
        className="w-full sm:max-w-[520px] bg-[#14141f] border-white/[0.08] p-0 flex flex-col"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-7 h-7 rounded-lg flex items-center justify-center
                     text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoading || !task ? (
          <div className="px-6 pt-10">
            <DrawerSkeleton />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <SheetHeader className="px-6 pt-8 pb-4">
              {/* Column breadcrumb */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-xs text-zinc-600">
                  {columns.find((c) => c.id === task.columnId)?.title ??
                    "Unknown"}
                </span>
              </div>

              <SheetTitle className="text-lg font-semibold text-zinc-100 text-left leading-snug">
                {task.title}
              </SheetTitle>

              {task.description && (
                <p className="text-sm text-zinc-400 leading-relaxed text-left mt-2">
                  {task.description}
                </p>
              )}
            </SheetHeader>

            <div className="px-6 pb-8 space-y-5">
              {/* ── Meta fields ── */}
              <Section label="Details">
                {/* Priority */}
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
                    <SelectTrigger
                      className="h-8 text-xs bg-white/[0.04] border-white/[0.09]
                                 focus:ring-0 focus:border-indigo-500/40"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c1c28] border-white/10">
                      {(["urgent", "high", "medium", "low"] as Priority[]).map(
                        (p) => {
                          const cfg = PRIORITY_CONFIG[p];
                          return (
                            <SelectItem
                              key={p}
                              value={p}
                              className="text-zinc-300 focus:text-white focus:bg-white/10 text-sm"
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${cfg.dot}`}
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

                {/* Assignee */}
                <MetaRow
                  icon={<User className="w-3.5 h-3.5" />}
                  label="Assignee"
                >
                  <Select
                    value={task.assignee?.id ?? "unassigned"}
                    onValueChange={(v) =>
                      onUpdateAssignee(task.id, v === "unassigned" ? null : v)
                    }
                  >
                    <SelectTrigger
                      className="h-8 text-xs bg-white/[0.04] border-white/[0.09]
                                 focus:ring-0 focus:border-indigo-500/40"
                    >
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c1c28] border-white/10">
                      <SelectItem
                        value="unassigned"
                        className="text-zinc-400 focus:text-white focus:bg-white/10 text-sm"
                      >
                        Unassigned
                      </SelectItem>
                      {members.map((m) => (
                        <SelectItem
                          key={m.id}
                          value={m.id}
                          className="text-zinc-300 focus:text-white focus:bg-white/10 text-sm"
                        >
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MetaRow>

                {/* Due date */}
                <MetaRow
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Due date"
                >
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                    onChange={(e) =>
                      onUpdateDueDate(task.id, e.target.value || null)
                    }
                    className="h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.09]
                               text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/40
                               [color-scheme:dark] transition-colors"
                  />
                </MetaRow>

                {/* Move to column */}
                <MetaRow
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  label="Move to"
                >
                  <Select
                    value={task.columnId}
                    onValueChange={(v) => onMoveToColumn(task.id, v)}
                  >
                    <SelectTrigger
                      className="h-8 text-xs bg-white/[0.04] border-white/[0.09]
                                 focus:ring-0 focus:border-indigo-500/40"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c1c28] border-white/10">
                      {columns.map((col) => (
                        <SelectItem
                          key={col.id}
                          value={col.id}
                          className="text-zinc-300 focus:text-white focus:bg-white/10 text-sm"
                        >
                          {col.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MetaRow>

                {/* Tags */}
                {task.tags.length > 0 && (
                  <MetaRow icon={<Tag className="w-3.5 h-3.5" />} label="Tags">
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[11px] text-zinc-400 border-white/10 bg-white/[0.04]
                                     px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </MetaRow>
                )}
              </Section>

              {/* ── Subtasks ── */}
              <Section label="Subtasks">
                <SubtaskChecklist
                  taskId={task.id}
                  subtasks={task.subtasks}
                  onToggle={onToggleSubtask}
                  onAdd={onAddSubtask}
                  onDelete={onDeleteSubtask}
                />
              </Section>

              {/* ── Comments ── */}
              <Section label="Comments">
                <CommentThread
                  comments={task.comments}
                  currentUser={currentUser}
                  onAddComment={onAddComment}
                  isSubmitting={isSubmittingComment}
                />
              </Section>

              {/* ── Activity log ── */}
              {task.activityLog.length > 0 && (
                <Section label="Activity">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Activity
                  </h4>
                  <div className="space-y-2.5">
                    {task.activityLog.map((event) => (
                      <div key={event.id} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-zinc-400">
                            <span className="font-medium text-zinc-300">
                              {event.actor.name}
                            </span>{" "}
                            {event.action}
                          </span>
                          <span className="block text-[11px] text-zinc-600 mt-0.5">
                            {format(
                              new Date(event.createdAt),
                              "MMM d 'at' h:mm a",
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
