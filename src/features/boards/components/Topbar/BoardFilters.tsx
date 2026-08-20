// features/boards/components/BoardFilters.tsx
// Dev 4 — filter bar. All changes push to URL via useSetUrlFilters.
// RULE: never mutates sort_order arrays. Filtering = visual hide only.

import { X, User, Calendar, Filter, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { BoardFiltersState, Priority, BoardMember } from "../../types";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../../constants";
import { FilterDropdown } from "./FilterDropdown";
import { TaskPriority, TaskStatus } from "../../types/enums";
import { TASK_STATUSES } from "../../utils/task-status";

interface BoardFiltersProps {
  filters: BoardFiltersState;
  members: BoardMember[];
  onChangeStatus: (statuses: TaskStatus[]) => void;
  onChangePriority: (priorities: Priority[]) => void;
  onChangeAssignee: (assigneeIds: string[]) => void;
  onChangeDueDate: (due: BoardFiltersState["dueDateRange"]) => void;
  onToggleMyTasks: () => void;
  onReset: () => void;
  activeCount: number;
}

const PRIORITY_OPTIONS: Priority[] = [
  TaskPriority.URGENT,
  TaskPriority.HIGH,
  TaskPriority.MEDIUM,
  TaskPriority.LOW,
];

const DUE_OPTIONS: {
  value: NonNullable<BoardFiltersState["dueDateRange"]>;
  label: string;
}[] = [
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "this_week", label: "Due this week" },
];

export function BoardFilters({
  filters,
  members,
  onChangeStatus,
  onChangePriority,
  onChangeAssignee,
  onChangeDueDate,
  onToggleMyTasks,
  onReset,
  activeCount,
}: BoardFiltersProps) {
  const toggleStatus = (status: TaskStatus) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((x) => x !== status)
      : [...filters.statuses, status];
    onChangeStatus(next);
  };

  const togglePriority = (p: Priority) => {
    const next = filters.priorities.includes(p)
      ? filters.priorities.filter((x) => x !== p)
      : [...filters.priorities, p];
    onChangePriority(next);
  };

  const toggleAssignee = (id: string) => {
    const next = filters.assigneeIds.includes(id)
      ? filters.assigneeIds.filter((x) => x !== id)
      : [...filters.assigneeIds, id];
    onChangeAssignee(next);
  };

  const toggleDue = (val: NonNullable<BoardFiltersState["dueDateRange"]>) =>
    onChangeDueDate(filters.dueDateRange === val ? null : val);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <FilterDropdown
        label="Status"
        icon={ListFilter}
        options={TASK_STATUSES.map((status) => ({
          value: status,
          label: STATUS_CONFIG[status].label,
          dotClassName: STATUS_CONFIG[status].dotClass,
        }))}
        selected={filters.statuses}
        onToggle={toggleStatus}
      />

      <FilterDropdown
        label="Priority"
        icon={Filter}
        options={PRIORITY_OPTIONS.map((priority) => ({
          value: priority,
          label: PRIORITY_CONFIG[priority].label,
          dotClassName: PRIORITY_CONFIG[priority].dotClass,
        }))}
        selected={filters.priorities}
        onToggle={togglePriority}
      />

      <FilterDropdown
        label="Assignee"
        icon={User}
        options={members.map((member) => ({
          value: member.id,
          label: member.name,
        }))}
        selected={filters.assigneeIds}
        onToggle={toggleAssignee}
        contentClassName="w-48"
        description="Filter by member"
      />

      <FilterDropdown
        label="Due date"
        icon={Calendar}
        options={DUE_OPTIONS}
        selected={filters.dueDateRange ? [filters.dueDateRange] : []}
        onToggle={toggleDue}
        multiple={false}
      />

      {/* My tasks */}
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-8 text-xs gap-1.5",
          filters.showOnlyMyTasks &&
            "border-primary/40 bg-primary/8 text-primary",
        )}
        onClick={onToggleMyTasks}
      >
        <User className="size-3" />
        My tasks
      </Button>

      {/* Separator + Clear */}
      {activeCount > 0 && (
        <>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
            onClick={onReset}
          >
            <X className="size-3" />
            Clear ({activeCount})
          </Button>
        </>
      )}
    </div>
  );
}
