import { BoardFilters } from "@/features/boards/components/Topbar/BoardFilters";
import { BoardSearchBar } from "@/features/boards/components/Topbar/BoardSearchBar";
import type { BoardFiltersState, BoardMember } from "@/features/boards/types";

interface CalendarFiltersProps {
  filters: BoardFiltersState;
  members: BoardMember[];
  activeCount: number;
  onChangeFilters: (patch: Partial<BoardFiltersState>) => void;
  onReset: () => void;
}

export function CalendarFilters({
  filters,
  members,
  activeCount,
  onChangeFilters,
  onReset,
}: CalendarFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <BoardSearchBar
        value={filters.search}
        onChange={(search) => onChangeFilters({ search })}
        className="w-full sm:w-auto"
      />
      <BoardFilters
        filters={filters}
        members={members}
        onChangeStatus={(statuses) => onChangeFilters({ statuses })}
        onChangePriority={(priorities) => onChangeFilters({ priorities })}
        onChangeAssignee={(assigneeIds) => onChangeFilters({ assigneeIds })}
        onChangeDueDate={(dueDateRange) => onChangeFilters({ dueDateRange })}
        onToggleMyTasks={() =>
          onChangeFilters({ showOnlyMyTasks: !filters.showOnlyMyTasks })
        }
        onReset={onReset}
        activeCount={activeCount}
      />
    </div>
  );
}
