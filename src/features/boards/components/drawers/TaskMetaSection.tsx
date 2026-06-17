import {
  ArrowRight,
  Calendar,
  ChartNoAxesColumnDecreasing,
  Tag,
  User,
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
import { PRIORITY_CONFIG } from "../../constants";
import type {
  BoardColumn,
  BoardMember,
  Priority,
  TaskDetail,
} from "../../types";
import { MetaRow } from "./MetaRow";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TaskMetaSectionProps {
  className?: string;
  task: TaskDetail;
  columns: BoardColumn[];
  members: BoardMember[];
  onUpdatePriority: (taskId: string, priority: Priority) => void;
  onUpdateAssignee: (taskId: string, assigneeId: string | null) => void;
  onUpdateDueDate: (taskId: string, dueDate: string | null) => void;
  onMoveToColumn: (taskId: string, columnId: string) => void;
}

const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];

export function TaskMetaSection({
  task,
  columns,
  members,
  onUpdatePriority,
  onUpdateAssignee,
  onUpdateDueDate,
  onMoveToColumn,
  className,
}: TaskMetaSectionProps) {
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
          value={task.columnId}
          onValueChange={(value) => onMoveToColumn(task.id, value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => (
              <SelectItem key={column.id} value={column.id} className="text-sm">
                {column.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MetaRow>

      {task.tags.length > 0 && (
        <MetaRow icon={Tag} label="Tags">
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                size="sm"
                shape="pill"
                className="font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </MetaRow>
      )}
    </div>
  );
}
