// features/boards/components/BoardFilters.tsx
// Dev 4 — filter bar for priority, assignee, due date.
// RULE: filters must NEVER mutate sort_order arrays. Filtering = visual hide only.

import { X, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type {
  BoardFiltersState,
  BoardMember,
  Priority,
} from "../types/types.index (1)";
import { PRIORITY_CONFIG } from "../constants/constants.index";

interface BoardFiltersProps {
  filters: BoardFiltersState;
  members: BoardMember[];
  currentUserId: string;
  onChange: (patch: Partial<BoardFiltersState>) => void;
  onReset: () => void;
}

const PRIORITY_OPTIONS: Priority[] = ["urgent", "high", "medium", "low"];
const DUE_DATE_OPTIONS = [
  { value: "overdue" as const, label: "Overdue" },
  { value: "today" as const, label: "Due today" },
  { value: "this_week" as const, label: "Due this week" },
];

// ─── Active filter count badge ────────────────────────────────────────────────
function activeCount(filters: BoardFiltersState): number {
  let n = 0;
  if (filters.priorities.length) n++;
  if (filters.assigneeIds.length) n++;
  if (filters.dueDateRange) n++;
  if (filters.showOnlyMyTasks) n++;
  return n;
}

// ─── Priority filter ──────────────────────────────────────────────────────────
function PriorityFilter({
  selected,
  onChange,
}: {
  selected: Priority[];
  onChange: (v: Priority[]) => void;
}) {
  const toggle = (p: Priority) =>
    selected.includes(p)
      ? onChange(selected.filter((x) => x !== p))
      : onChange([...selected, p]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 text-xs font-medium rounded-lg border
            ${
              selected.length
                ? "border-indigo-500/40 text-indigo-300 bg-indigo-500/10"
                : "border-white/[0.09] text-zinc-400 bg-white/[0.04] hover:text-zinc-200"
            }`}
        >
          Priority
          {selected.length > 0 && (
            <Badge className="h-4 min-w-4 px-1 text-[10px] bg-indigo-500 text-white border-0">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-44 bg-[#1c1c28] border-white/10"
      >
        <DropdownMenuLabel className="text-zinc-500 text-xs">
          Filter by priority
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {PRIORITY_OPTIONS.map((p) => {
          const cfg = PRIORITY_CONFIG[p];
          return (
            <DropdownMenuCheckboxItem
              key={p}
              checked={selected.includes(p)}
              onCheckedChange={() => toggle(p)}
              className="text-zinc-300 focus:text-white focus:bg-white/10 text-sm gap-2"
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Assignee filter ──────────────────────────────────────────────────────────
function AssigneeFilter({
  members,
  selected,
  onChange,
}: {
  members: BoardMember[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) =>
    selected.includes(id)
      ? onChange(selected.filter((x) => x !== id))
      : onChange([...selected, id]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 text-xs font-medium rounded-lg border
            ${
              selected.length
                ? "border-indigo-500/40 text-indigo-300 bg-indigo-500/10"
                : "border-white/[0.09] text-zinc-400 bg-white/[0.04] hover:text-zinc-200"
            }`}
        >
          <User className="w-3 h-3" />
          Assignee
          {selected.length > 0 && (
            <Badge className="h-4 min-w-4 px-1 text-[10px] bg-indigo-500 text-white border-0">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48 bg-[#1c1c28] border-white/10"
      >
        <DropdownMenuLabel className="text-zinc-500 text-xs">
          Filter by member
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {members.map((m) => (
          <DropdownMenuCheckboxItem
            key={m.id}
            checked={selected.includes(m.id)}
            onCheckedChange={() => toggle(m.id)}
            className="text-zinc-300 focus:text-white focus:bg-white/10 text-sm"
          >
            {m.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Due date filter ──────────────────────────────────────────────────────────
function DueDateFilter({
  value,
  onChange,
}: {
  value: BoardFiltersState["dueDateRange"];
  onChange: (v: BoardFiltersState["dueDateRange"]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 text-xs font-medium rounded-lg border
            ${
              value
                ? "border-indigo-500/40 text-indigo-300 bg-indigo-500/10"
                : "border-white/[0.09] text-zinc-400 bg-white/[0.04] hover:text-zinc-200"
            }`}
        >
          Due date
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-44 bg-[#1c1c28] border-white/10"
      >
        <DropdownMenuLabel className="text-zinc-500 text-xs">
          Filter by due date
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {DUE_DATE_OPTIONS.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={value === opt.value}
            onCheckedChange={() =>
              onChange(value === opt.value ? null : opt.value)
            }
            className="text-zinc-300 focus:text-white focus:bg-white/10 text-sm"
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main filter bar ──────────────────────────────────────────────────────────
export function BoardFilters({
  filters,
  members,
  onChange,
  onReset,
}: BoardFiltersProps) {
  const count = activeCount(filters);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <PriorityFilter
        selected={filters.priorities}
        onChange={(priorities) => onChange({ priorities })}
      />

      <AssigneeFilter
        members={members}
        selected={filters.assigneeIds}
        onChange={(assigneeIds) => onChange({ assigneeIds })}
      />

      <DueDateFilter
        value={filters.dueDateRange}
        onChange={(dueDateRange) => onChange({ dueDateRange })}
      />

      {/* My tasks toggle */}
      <button
        onClick={() => onChange({ showOnlyMyTasks: !filters.showOnlyMyTasks })}
        className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all duration-150
          ${
            filters.showOnlyMyTasks
              ? "border-indigo-500/40 text-indigo-300 bg-indigo-500/10"
              : "border-white/[0.09] text-zinc-400 bg-white/[0.04] hover:text-zinc-200"
          }`}
      >
        My tasks
      </button>

      {/* Clear all */}
      {count > 0 && (
        <button
          onClick={onReset}
          className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs text-zinc-500
                     hover:text-zinc-300 hover:bg-white/[0.05] transition-all duration-150"
        >
          <X className="w-3 h-3" />
          Clear ({count})
        </button>
      )}
    </div>
  );
}
