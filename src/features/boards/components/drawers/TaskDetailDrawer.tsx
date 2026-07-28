import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SubtaskChecklist } from "./SubtaskChecklist";
import { CommentThread } from "./CommentThread";
import { TimeLogSection } from "./TimeLogSection";
import { DrawerSkeleton } from "./DrawerSkeleton";
import { TaskDetailHeader } from "./TaskDetailHeader";
import { TaskMetaSection } from "./TaskMetaSection";
import { ActivityLog } from "./ActivityLog";
import type {
  TaskDetail,
  Priority,
  BoardMember,
  BoardColumn,
  TimeLog,
} from "../../types";
import type { TaskStatus } from "../../types/enums";
import { Separator } from "@/components/ui/separator";

interface TaskDetailDrawerProps {
  task: TaskDetail | null;
  columns: BoardColumn[];
  members: BoardMember[];
  timeLogs: TimeLog[];
  currentUser: BoardMember;
  isOpen: boolean;
  isLoading?: boolean;
  isLoadingTimeLogs?: boolean;
  onClose: () => void;
  onUpdateTitle: (taskId: string, title: string) => void;
  onUpdateDescription: (taskId: string, description: string) => void;
  onUpdateLabel: (taskId: string, label: string) => void;
  onUpdatePriority: (taskId: string, priority: Priority) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onUpdateAssignee: (taskId: string, assigneeId: string | null) => void;
  onUpdateDueDate: (taskId: string, dueDate: string | null) => void;
  onMoveToColumn: (taskId: string, columnId: string) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onAddSubtask: (title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddComment: (content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddTimeLog: (data: {
    durationMin: number;
    loggedDate: string;
    note?: string;
  }) => void;
  onDeleteTimeLog: (timeLogId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  isSubmittingComment?: boolean;
  isUpdatingComment?: boolean;
  isDeletingComment?: boolean;
  isUpdatingTask?: boolean;
  isSubmittingTimeLog?: boolean;
  isDeletingTimeLog?: boolean;
  isDeletingTask?: boolean;
}

export function TaskDetailDrawer({
  task,
  columns,
  members,
  timeLogs,
  currentUser,
  isOpen,
  isLoading = false,
  isLoadingTimeLogs,
  onClose,
  onUpdateTitle,
  onUpdateDescription,
  onUpdateLabel,
  onUpdatePriority,
  onUpdateStatus,
  onUpdateAssignee,
  onUpdateDueDate,
  onMoveToColumn,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddTimeLog,
  onDeleteTimeLog,
  onDeleteTask,
  isSubmittingComment,
  isUpdatingComment,
  isDeletingComment,
  isUpdatingTask,
  isSubmittingTimeLog,
  isDeletingTimeLog,
  isDeletingTask,
}: TaskDetailDrawerProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(task?.description ?? "");

  const submitDescription = () => {
    if (!task || isUpdatingTask) return;

    onUpdateDescription(task.id, description.trim());
    setIsEditingDescription(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-125 p-0 flex flex-col gap-0 overflow-hidden"
      >
        {isLoading || !task ? (
          <DrawerSkeleton />
        ) : (
          <>
            <TaskDetailHeader
              task={task}
              columns={columns}
              onUpdateTitle={onUpdateTitle}
              isUpdating={isUpdatingTask}
            />

            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-5 custom-scrollbar">
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Description
                  </p>
                  {!isEditingDescription && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                      onClick={() => {
                        setDescription(task.description ?? "");
                        setIsEditingDescription(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                </div>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={4}
                      placeholder="Add a description"
                      className="resize-none text-sm"
                    />
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setIsEditingDescription(false);
                          setDescription(task.description ?? "");
                        }}
                      >
                        <X className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        className="size-8"
                        disabled={isUpdatingTask}
                        onClick={submitDescription}
                      >
                        <Check className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed text-left">
                    {task.description || "No description yet."}
                  </p>
                )}
              </div>
              <Separator />

              <TaskMetaSection
                task={task}
                columns={columns}
                members={members}
                onUpdatePriority={onUpdatePriority}
                onUpdateStatus={onUpdateStatus}
                onUpdateAssignee={onUpdateAssignee}
                onUpdateDueDate={onUpdateDueDate}
                onUpdateLabel={onUpdateLabel}
                onMoveToColumn={onMoveToColumn}
              />
              <Separator />
              <SubtaskChecklist
                taskId={task.id}
                subtasks={task.subtasks}
                onToggle={onToggleSubtask}
                onAdd={onAddSubtask}
                onDelete={onDeleteSubtask}
              />
              <Separator />
              <CommentThread
                comments={task.comments}
                currentUser={currentUser}
                onAddComment={onAddComment}
                onUpdateComment={onUpdateComment}
                onDeleteComment={onDeleteComment}
                isSubmitting={isSubmittingComment}
                isUpdating={isUpdatingComment}
                isDeleting={isDeletingComment}
              />
              <Separator />
              <TimeLogSection
                timeLogs={timeLogs}
                isLoading={isLoadingTimeLogs}
                isSubmitting={isSubmittingTimeLog}
                isDeleting={isDeletingTimeLog}
                onAddTimeLog={onAddTimeLog}
                onDeleteTimeLog={onDeleteTimeLog}
              />
              <ActivityLog events={task.activityLog} />
              {onDeleteTask && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full py-4   justify-center gap-1.5"
                      isLoading={isDeletingTask}
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete task
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
