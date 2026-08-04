import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  ChartNoAxesColumnDecreasing,
  CircleDot,
  GitBranch,
  Pencil,
  Tag,
  User,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../../constants";
import type {
  BoardColumn,
  BoardMember,
  Priority,
  Task,
  TaskDetail,
  TaskId,
} from "../../types";
import { MetaRow } from "./MetaRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskPriority, type TaskStatus } from "../../types/enums";
import { TASK_STATUSES } from "../../utils/task-status";
import { TaskDependencyPicker } from "./TaskDependencyPicker";

interface TaskMetaSectionProps {
  className?: string;
  task: TaskDetail;
  tasks: Task[];
  columns: BoardColumn[];
  members: BoardMember[];
  isUpdatingTask?: boolean;
  onUpdatePriority: (taskId: string, priority: Priority) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onUpdateAssignee: (taskId: string, assigneeId: string | null) => void;
  onUpdateDueDate: (taskId: string, dueDate: string | null) => void;
  onUpdateDependencies: (taskId: TaskId, dependencyIds: TaskId[]) => void;
  onUpdateLabel: (taskId: string, label: string) => void;
  onMoveToColumn: (taskId: string, columnId: string) => void;
}

const PRIORITIES: Priority[] = [
  TaskPriority.URGENT,
  TaskPriority.HIGH,
  TaskPriority.MEDIUM,
  TaskPriority.LOW,
];

interface LabelDraft {
  taskId: string;
  sourceLabel: string;
  value: string;
}

export function TaskMetaSection({
  task,
  tasks,
  columns,
  members,
  isUpdatingTask,
  onUpdatePriority,
  onUpdateStatus,
  onUpdateAssignee,
  onUpdateDueDate,
  onUpdateDependencies,
  onUpdateLabel,
  onMoveToColumn,
  className,
}: TaskMetaSectionProps) {
  const currentLabel = task.tags?.[0] ?? "";
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState<LabelDraft | null>(null);
  const label =
    labelDraft?.taskId === task.id && labelDraft.sourceLabel === currentLabel
      ? labelDraft.value
      : currentLabel;

  const submitLabel = () => {
    const trimmedLabel = label.trim();
    if (trimmedLabel === currentLabel) {
      setIsEditingLabel(false);
      setLabelDraft(null);
      return;
    }
    onUpdateLabel(task.id, trimmedLabel);
    setIsEditingLabel(false);
    setLabelDraft(null);
  };

  const startEditingLabel = () => {
    setLabelDraft({
      taskId: task.id,
      sourceLabel: currentLabel,
      value: currentLabel,
    });
    setIsEditingLabel(true);
  };

  const cancelEditingLabel = () => {
    setIsEditingLabel(false);
    setLabelDraft(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <MetaRow icon={ChartNoAxesColumnDecreasing} label="Priority">
        <Select
          value={task.priority}
          onValueChange={(value) =>
            onUpdatePriority(task.id, value as Priority)
          }
        >
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PRIORITIES.map((priority) => {
                const config = PRIORITY_CONFIG[priority];

                return (
                  <SelectItem
                    key={priority}
                    value={priority}
                    className="text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn("size-2 rounded-full", config.dotClass)}
                      />
                      {config.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </MetaRow>

      <MetaRow icon={CircleDot} label="Status">
        <Select
          value={task.status}
          onValueChange={(value) =>
            onUpdateStatus(task.id, value as TaskStatus)
          }
        >
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {TASK_STATUSES.map((status) => {
                const config = STATUS_CONFIG[status];

                return (
                  <SelectItem key={status} value={status} className="text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn("size-2 rounded-full", config.dotClass)}
                      />
                      {config.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </MetaRow>

      <MetaRow icon={User} label="Assignee">
        <Select
          value={task.assignee?.id ?? "unassigned"}
          onValueChange={(value) =>
            onUpdateAssignee(task.id, value === "unassigned" ? null : value)
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
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id} className="text-sm">
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MetaRow>

      <MetaRow icon={Calendar} label="Due date">
        <Input
          type="date"
          value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
          onChange={(event) =>
            onUpdateDueDate(task.id, event.target.value || null)
          }
          className="h-8 text-xs scheme-dark"
        />
      </MetaRow>

      <MetaRow icon={ArrowRight} label="Move to">
        <Select
          value={task.boardColumnId}
          onValueChange={(value) => onMoveToColumn(task.id, value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => (
              <SelectItem key={column.id} value={column.id} className="text-sm">
                {column.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MetaRow>

      <MetaRow icon={GitBranch} label="Depends on">
        <TaskDependencyPicker
          task={task}
          tasks={tasks}
          columns={columns}
          isUpdating={isUpdatingTask}
          onChangeDependencies={onUpdateDependencies}
        />
      </MetaRow>

      <MetaRow icon={Tag} label="Label">
        {isEditingLabel ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={label}
              onChange={(event) =>
                setLabelDraft({
                  taskId: task.id,
                  sourceLabel: currentLabel,
                  value: event.target.value,
                })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitLabel();
                }

                if (event.key === "Escape") {
                  cancelEditingLabel();
                }
              }}
              placeholder="Add label"
              className="h-8 text-xs"
              autoFocus
            />
            <Button
              type="button"
              size="icon"
              className="size-8 shrink-0"
              onClick={submitLabel}
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={cancelEditingLabel}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-1.5">
            {currentLabel ? (
              <Badge
                variant="secondary"
                size="sm"
                shape="pill"
                className="max-w-44 truncate font-normal"
              >
                {currentLabel}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">No label</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto size-7 shrink-0 text-muted-foreground"
              onClick={startEditingLabel}
            >
              <Pencil className="size-3.5" />
            </Button>
            {currentLabel && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onUpdateLabel(task.id, "")}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </MetaRow>
    </div>
  );
}
