import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Save, Trash2 } from "lucide-react";
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
import { AttachmentSection } from "./AttachmentSection";
import type {
  TaskDetail,
  Task,
  Priority,
  BoardMember,
  BoardColumn,
  TimeLog,
  TaskId,
} from "../../types";
import { Separator } from "@/components/ui/separator";
import type {
  ApiTaskAssigneeRecommendation,
  ApiTaskBreakdownSubtask,
  CreateSubtaskDto,
  UpdateSubtaskDto,
  UpdateTaskDto,
} from "../../types/api/board-api.types";

interface TaskDetailDrawerProps {
  task: TaskDetail | null;
  tasks: Task[];
  columns: BoardColumn[];
  members: BoardMember[];
  timeLogs: TimeLog[];
  currentUser: BoardMember;
  isOpen: boolean;
  isLoading?: boolean;
  isLoadingTimeLogs?: boolean;
  assigneeRecommendation?: ApiTaskAssigneeRecommendation | null;
  isRecommendingAssignee?: boolean;
  isGeneratingTaskBreakdown?: boolean;
  onClose: () => void;
  onRecommendAssignee?: () => void;
  onClearAssigneeRecommendation?: () => void;
  onGenerateTaskBreakdown?: (
    onSuccess: (subtasks: ApiTaskBreakdownSubtask[]) => void,
  ) => void;
  onSaveChanges: (taskId: string, dto: UpdateTaskDto) => void;
  onCreateSubtask: (dto: CreateSubtaskDto) => void;
  onUpdateSubtask: (subtaskId: string, dto: UpdateSubtaskDto) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onMoveToColumn: (taskId: string, columnId: string) => void;
  onAddComment: (content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddTimeLog: (data: {
    durationMin: number;
    loggedDate: string;
    note?: string;
  }) => void;
  onDeleteTimeLog: (timeLogId: string) => void;
  onUploadAttachments: (files: File[]) => void;
  onDeleteAttachment: (attachmentId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  isSubmittingComment?: boolean;
  isUpdatingComment?: boolean;
  isDeletingComment?: boolean;
  isUpdatingTask?: boolean;
  isSubmittingTimeLog?: boolean;
  isDeletingTimeLog?: boolean;
  isUploadingAttachments?: boolean;
  isDeletingAttachment?: boolean;
  isDeletingTask?: boolean;
}

interface TaskDetailsDraft {
  taskId: string;
  title: string;
  description: string;
  label: string;
  priority: Priority;
  status: Task["status"];
  assigneeId: string | null;
  dueDate: string;
  dependencyIds: TaskId[];
  subtasks: SubtaskDraft[];
}

interface SubtaskDraft {
  id: string;
  sourceId?: string;
  title: string;
  completed: boolean;
}

function createDraftFromTask(task: TaskDetail): TaskDetailsDraft {
  return {
    taskId: task.id,
    title: task.title,
    description: task.description ?? "",
    label: task.tags?.[0] ?? "",
    priority: task.priority,
    status: task.status,
    assigneeId: task.assignee?.id ?? null,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    dependencyIds: task.dependencyIds ?? [],
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      sourceId: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
    })),
  };
}

function normalizeDraft(draft: TaskDetailsDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    label: draft.label.trim(),
    priority: draft.priority,
    status: draft.status,
    assigneeId: draft.assigneeId,
    dueDate: draft.dueDate,
    dependencyIds: [...draft.dependencyIds].sort(),
    subtasks: draft.subtasks.map((subtask) => ({
      sourceId: subtask.sourceId,
      title: subtask.title.trim(),
      completed: subtask.completed,
    })),
  };
}

function createSaveDto(draft: TaskDetailsDraft): UpdateTaskDto {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    label: draft.label.trim(),
    priority: draft.priority,
    status: draft.status,
    assigneeId: draft.assigneeId,
    deadline: draft.dueDate || null,
    dependencyIds: draft.dependencyIds,
  };
}

function createSubtaskChangeSet(task: TaskDetail, draft: TaskDetailsDraft) {
  const currentSubtaskById = new Map(
    task.subtasks.map((subtask) => [subtask.id, subtask]),
  );
  const draftSourceIds = new Set(
    draft.subtasks
      .map((subtask) => subtask.sourceId)
      .filter((sourceId): sourceId is string => !!sourceId),
  );

  return {
    created: draft.subtasks
      .filter((subtask) => !subtask.sourceId && subtask.title.trim())
      .map((subtask) => ({ title: subtask.title.trim() })),
    updated: draft.subtasks
      .filter((subtask) => {
        if (!subtask.sourceId) return false;

        const currentSubtask = currentSubtaskById.get(subtask.sourceId);

        return (
          currentSubtask &&
          (currentSubtask.title !== subtask.title.trim() ||
            currentSubtask.completed !== subtask.completed)
        );
      })
      .map((subtask) => ({
        subtaskId: subtask.sourceId as string,
        dto: {
          title: subtask.title.trim(),
          completed: subtask.completed,
        },
      })),
    deleted: task.subtasks
      .filter((subtask) => !draftSourceIds.has(subtask.id))
      .map((subtask) => subtask.id),
  };
}

export function TaskDetailDrawer({
  task,
  tasks,
  columns,
  members,
  timeLogs,
  currentUser,
  isOpen,
  isLoading = false,
  isLoadingTimeLogs,
  assigneeRecommendation,
  isRecommendingAssignee,
  isGeneratingTaskBreakdown,
  onClose,
  onRecommendAssignee,
  onClearAssigneeRecommendation,
  onGenerateTaskBreakdown,
  onSaveChanges,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onMoveToColumn,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddTimeLog,
  onDeleteTimeLog,
  onUploadAttachments,
  onDeleteAttachment,
  onDeleteTask,
  isSubmittingComment,
  isUpdatingComment,
  isDeletingComment,
  isUpdatingTask,
  isSubmittingTimeLog,
  isDeletingTimeLog,
  isUploadingAttachments,
  isDeletingAttachment,
  isDeletingTask,
}: TaskDetailDrawerProps) {
  const [draft, setDraft] = useState<TaskDetailsDraft | null>(() =>
    task ? createDraftFromTask(task) : null,
  );
  const [hasUserEdited, setHasUserEdited] = useState(false);

  useEffect(() => {
    // The drawer keeps a local editable draft that must reset when a new task is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft((currentDraft) => {
      if (!task) {
        setHasUserEdited(false);
        return null;
      }

      if (!currentDraft || currentDraft.taskId !== task.id || !hasUserEdited) {
        if (currentDraft?.taskId !== task.id) {
          setHasUserEdited(false);
        }

        return createDraftFromTask(task);
      }

      return currentDraft;
    });
  }, [hasUserEdited, task]);

  const hasUnsavedChanges = useMemo(() => {
    if (!task || !draft) return false;

    return (
      JSON.stringify(normalizeDraft(draft)) !==
      JSON.stringify(normalizeDraft(createDraftFromTask(task)))
    );
  }, [draft, task]);
  const hasInvalidSubtasks = draft?.subtasks.some(
    (subtask) => !subtask.title.trim(),
  ) ?? false;

  const setDraftValue = <K extends keyof TaskDetailsDraft>(
    key: K,
    value: TaskDetailsDraft[K],
  ) => {
    setHasUserEdited(true);
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = () => {
    if (!task || !draft || isUpdatingTask || !hasUnsavedChanges) return;
    if (!draft.title.trim()) return;
    if (hasInvalidSubtasks) return;

    const taskDraftChanged =
      JSON.stringify({
        ...normalizeDraft(draft),
        subtasks: undefined,
      }) !==
      JSON.stringify({
        ...normalizeDraft(createDraftFromTask(task)),
        subtasks: undefined,
      });
    const subtaskChanges = createSubtaskChangeSet(task, draft);

    if (taskDraftChanged) {
      onSaveChanges(task.id, createSaveDto(draft));
    }

    subtaskChanges.created.forEach((dto) => onCreateSubtask(dto));
    subtaskChanges.updated.forEach(({ subtaskId, dto }) =>
      onUpdateSubtask(subtaskId, dto),
    );
    subtaskChanges.deleted.forEach((subtaskId) => onDeleteSubtask(subtaskId));
    setHasUserEdited(false);
  };

  const handleDiscard = () => {
    if (!task) return;
    setHasUserEdited(false);
    setDraft(createDraftFromTask(task));
  };

  const handleAddTaskBreakdown = (
    suggestedSubtasks: ApiTaskBreakdownSubtask[],
  ) => {
    const sortedSuggestedSubtasks = [...suggestedSubtasks].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    if (!sortedSuggestedSubtasks.length) return;

    setHasUserEdited(true);
    setDraft((current) =>
      current
        ? {
          ...current,
          subtasks: [
            ...current.subtasks,
            ...sortedSuggestedSubtasks.map((subtask) => ({
              id: `draft-${crypto.randomUUID()}`,
              title: subtask.title,
              completed: false,
            })),
          ],
        }
        : current,
    );
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
              title={draft?.title ?? ""}
              disabled={isUpdatingTask}
              onTitleChange={(title) => setDraftValue("title", title)}
            />

            <div className="flex-1 overflow-y-auto px-6 pb-0 space-y-5 custom-scrollbar">
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Description
                  </p>
                </div>
                <Textarea
                  value={draft?.description ?? ""}
                  disabled={isUpdatingTask}
                  onChange={(event) =>
                    setDraftValue("description", event.target.value)
                  }
                  rows={4}
                  placeholder="Add a description"
                  className="resize-none text-sm"
                />
              </div>
              <Separator />

              <TaskMetaSection
                task={task}
                tasks={tasks}
                columns={columns}
                members={members}
                isUpdatingTask={isUpdatingTask}
                priority={draft?.priority ?? task.priority}
                status={draft?.status ?? task.status}
                assigneeId={draft?.assigneeId ?? null}
                dueDate={draft?.dueDate ?? ""}
                dependencyIds={draft?.dependencyIds ?? []}
                label={draft?.label ?? ""}
                onChangePriority={(priority) =>
                  setDraftValue("priority", priority)
                }
                onChangeStatus={(status) => setDraftValue("status", status)}
                onChangeAssignee={(assigneeId) =>
                  setDraftValue("assigneeId", assigneeId)
                }
                assigneeRecommendation={assigneeRecommendation}
                isRecommendingAssignee={isRecommendingAssignee}
                onRecommendAssignee={onRecommendAssignee}
                onClearAssigneeRecommendation={onClearAssigneeRecommendation}
                onChangeDueDate={(dueDate) =>
                  setDraftValue("dueDate", dueDate)
                }
                onChangeDependencies={(dependencyIds) =>
                  setDraftValue("dependencyIds", dependencyIds)
                }
                onChangeLabel={(label) => setDraftValue("label", label)}
                onMoveToColumn={onMoveToColumn}
              />
              <Separator />
              <AttachmentSection
                attachments={task.attachments}
                isUploading={isUploadingAttachments}
                isDeleting={isDeletingAttachment}
                onUploadAttachments={onUploadAttachments}
                onDeleteAttachment={onDeleteAttachment}
              />
              <Separator />
              <SubtaskChecklist
                subtasks={(draft?.subtasks ?? []).map((subtask, index) => ({
                  id: subtask.id,
                  taskId: task.id,
                  title: subtask.title,
                  completed: subtask.completed,
                  position: index,
                  createdAt: "",
                  updatedAt: "",
                }))}
                disabled={isUpdatingTask}
                isGeneratingBreakdown={isGeneratingTaskBreakdown}
                onGenerateAiBreakdown={() =>
                  onGenerateTaskBreakdown?.(handleAddTaskBreakdown)
                }
                onToggle={(subtaskId, completed) =>
                  setDraftValue(
                    "subtasks",
                    (draft?.subtasks ?? []).map((subtask) =>
                      subtask.id === subtaskId
                        ? { ...subtask, completed }
                        : subtask,
                    ),
                  )
                }
                onTitleChange={(subtaskId, title) =>
                  setDraftValue(
                    "subtasks",
                    (draft?.subtasks ?? []).map((subtask) =>
                      subtask.id === subtaskId ? { ...subtask, title } : subtask,
                    ),
                  )
                }
                onAdd={(title) =>
                  setDraftValue("subtasks", [
                    ...(draft?.subtasks ?? []),
                    {
                      id: `draft-${crypto.randomUUID()}`,
                      title,
                      completed: false,
                    },
                  ])
                }
                onDelete={(subtaskId) =>
                  setDraftValue(
                    "subtasks",
                    (draft?.subtasks ?? []).filter(
                      (subtask) => subtask.id !== subtaskId,
                    ),
                  )
                }
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
              <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-6 py-3 backdrop-blur">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!hasUnsavedChanges || isUpdatingTask}
                  onClick={handleDiscard}
                >
                  <RotateCcw className="size-3.5" />
                  Discard
                </Button>
                <Button
                  type="button"
                  size="sm"
                  isLoading={isUpdatingTask}
                  disabled={
                    !hasUnsavedChanges ||
                    !draft?.title.trim() ||
                    hasInvalidSubtasks
                  }
                  onClick={handleSave}
                >
                  <Save className="size-3.5" />
                  Save changes
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
