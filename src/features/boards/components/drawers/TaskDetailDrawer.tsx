import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SubtaskChecklist } from "./SubtaskChecklist";
import { CommentThread } from "./CommentThread";
import { DrawerSkeleton } from "./DrawerSkeleton";
import { TaskDetailHeader } from "./TaskDetailHeader";
import { TaskMetaSection } from "./TaskMetaSection";
import { ActivityLog } from "./ActivityLog";
import type {
  TaskDetail,
  Priority,
  BoardMember,
  BoardColumn,
} from "../../types";
import { Separator } from "@/components/ui/separator";

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
        className="w-full sm:max-w-125 p-0 flex flex-col gap-0 overflow-hidden"
      >
        {isLoading || !task ? (
          <DrawerSkeleton />
        ) : (
          <>
            <TaskDetailHeader task={task} columns={columns} />

            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-5 custom-scrollbar">
              {task.description && (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed text-left mt-5">
                    {task.description}
                    lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Voluptas, eaque Lorem ipsum, dolor sit amet consectetur
                    adipisicing elit. Cum, natus? Ab provident ut fuga qui
                    placeat rem? Ipsa enim assumenda odio impedit eaque
                    consequuntur rerum? Quas distinctio repellendus dicta iure.
                  </p>
                  <Separator />
                </>
              )}

              <TaskMetaSection
                task={task}
                columns={columns}
                members={members}
                onUpdatePriority={onUpdatePriority}
                onUpdateAssignee={onUpdateAssignee}
                onUpdateDueDate={onUpdateDueDate}
                onMoveToColumn={onMoveToColumn}
                className={task.description ? "" : "mt-4"}
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
                isSubmitting={isSubmittingComment}
              />
              <ActivityLog events={task.activityLog} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
