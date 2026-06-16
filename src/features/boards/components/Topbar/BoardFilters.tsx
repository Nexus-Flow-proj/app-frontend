// features/boards/components/BoardFilters.tsx
// Dev 4 — filter bar. All changes push to URL via useSetUrlFilters.
// RULE: never mutates sort_order arrays. Filtering = visual hide only.

import { X, ChevronDown, User, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { BoardFiltersState, Priority, BoardMember } from "../../types";
import { PRIORITY_CONFIG } from "../../constants";

interface BoardFiltersProps {
  filters: BoardFiltersState;
  members: BoardMember[];
  onChangePriority: (priorities: Priority[]) => void;
  onChangeAssignee: (assigneeIds: string[]) => void;
  onChangeDueDate: (due: BoardFiltersState["dueDateRange"]) => void;
  onToggleMyTasks: () => void;
  onReset: () => void;
  activeCount: number;
}

const PRIORITY_OPTIONS: Priority[] = ["urgent", "high", "medium", "low"];

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
  onChangePriority,
  onChangeAssignee,
  onChangeDueDate,
  onToggleMyTasks,
  onReset,
  activeCount,
}: BoardFiltersProps) {
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
      {/* Priority */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs",
              filters.priorities.length &&
                "border-primary/40 bg-primary/8 text-primary",
            )}
          >
            <Filter className="size-3" />
            Priority
            {filters.priorities.length > 0 && (
              <Badge className="h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground border-0 rounded-full">
                {filters.priorities.length}
              </Badge>
            )}
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel className="text-xs">
            Filter by priority
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PRIORITY_OPTIONS.map((p) => {
            const cfg = PRIORITY_CONFIG[p];
            return (
              <DropdownMenuCheckboxItem
                key={p}
                checked={filters.priorities.includes(p)}
                onCheckedChange={() => togglePriority(p)}
                className="text-sm gap-2"
              >
                <span
                  className={cn(
                    "size-2 rounded-full inline-block",
                    cfg.dotClass,
                  )}
                />
                {cfg.label}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assignee */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs",
              filters.assigneeIds.length &&
                "border-primary/40 bg-primary/8 text-primary",
            )}
          >
            <User className="size-3" />
            Assignee
            {filters.assigneeIds.length > 0 && (
              <Badge className="h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground border-0 rounded-full">
                {filters.assigneeIds.length}
              </Badge>
            )}
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs">
            Filter by member
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {members.map((m) => (
            <DropdownMenuCheckboxItem
              key={m.id}
              checked={filters.assigneeIds.includes(m.id)}
              onCheckedChange={() => toggleAssignee(m.id)}
              className="text-sm"
            >
              {m.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Due date */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs",
              filters.dueDateRange &&
                "border-primary/40 bg-primary/8 text-primary",
            )}
          >
            <Calendar className="size-3" />
            Due date
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel className="text-xs">
            Filter by due date
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {DUE_OPTIONS.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={filters.dueDateRange === opt.value}
              onCheckedChange={() => toggleDue(opt.value)}
              className="text-sm"
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
