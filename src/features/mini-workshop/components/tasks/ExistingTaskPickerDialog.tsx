import { useMemo, useState } from "react";
import { Check, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BoardFilters } from "@/features/boards/components/Topbar/BoardFilters";
import { BoardSearchBar } from "@/features/boards/components/Topbar/BoardSearchBar";
import { taskMatchesFilters } from "@/features/boards/hooks/useBoardFilters";
import type {
  BoardFiltersState,
  BoardMember,
  Task,
} from "@/features/boards/types";
import { PRIORITY_CONFIG } from "@/features/boards/constants";

const EMPTY_FILTERS: BoardFiltersState = {
  search: "",
  statuses: [],
  priorities: [],
  assigneeIds: [],
  dueDateRange: null,
  showOnlyMyTasks: false,
};

interface ExistingTaskPickerDialogProps {
  open: boolean;
  tasks: Task[];
  members: BoardMember[];
  currentUserId: string;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (tasks: Task[]) => void;
}

export function ExistingTaskPickerDialog({
  open,
  tasks,
  members,
  currentUserId,
  isLoading,
  onOpenChange,
  onAdd,
}: ExistingTaskPickerDialogProps) {
  const [filters, setFilters] = useState<BoardFiltersState>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredTasks = useMemo(
    () => tasks.filter((task) => taskMatchesFilters(task, filters, currentUserId)),
    [currentUserId, filters, tasks],
  );
  const activeCount = Number(Boolean(filters.search)) +
    Number(filters.statuses.length > 0) +
    Number(filters.priorities.length > 0) +
    Number(filters.assigneeIds.length > 0) +
    Number(Boolean(filters.dueDateRange)) +
    Number(filters.showOnlyMyTasks);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedIds(new Set());
      setFilters(EMPTY_FILTERS);
    }
    onOpenChange(nextOpen);
  };

  const toggleTask = (taskId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[min(760px,88vh)] flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add project tasks</DialogTitle>
          <DialogDescription>
            Choose any tasks to place as read-only references. Tasks already on the canvas can be added again.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 space-y-3 border-y py-3">
          <BoardSearchBar
            value={filters.search}
            onChange={(search) => setFilters((current) => ({ ...current, search }))}
          />
          <BoardFilters
            filters={filters}
            members={members}
            onChangeStatus={(statuses) => setFilters((current) => ({ ...current, statuses }))}
            onChangePriority={(priorities) => setFilters((current) => ({ ...current, priorities }))}
            onChangeAssignee={(assigneeIds) => setFilters((current) => ({ ...current, assigneeIds }))}
            onChangeDueDate={(dueDateRange) => setFilters((current) => ({ ...current, dueDateRange }))}
            onToggleMyTasks={() => setFilters((current) => ({ ...current, showOnlyMyTasks: !current.showOnlyMyTasks }))}
            onReset={() => setFilters(EMPTY_FILTERS)}
            activeCount={activeCount}
          />
        </div>

        <ScrollArea className="min-h-0 flex-1 pr-3">
          <div className="space-y-2 py-1">
            {isLoading && (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading project tasks...</p>
            )}
            {!isLoading && filteredTasks.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                <ClipboardList className="size-8" />
                <p className="text-sm">No tasks match these filters.</p>
              </div>
            )}
            {filteredTasks.map((task) => {
              const selected = selectedIds.has(task.id);
              return (
                <div key={task.id} className="flex items-center gap-2 rounded-lg border bg-background p-1.5">
                  <Checkbox checked={selected} onCheckedChange={() => toggleTask(task.id)} aria-label={`Select ${task.title}`} />
                  <Button type="button" variant="ghost" className="h-auto min-w-0 flex-1 justify-start gap-3 px-2 py-1.5 text-left" onClick={() => toggleTask(task.id)}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{task.title}</span>
                      <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                        {task.description || "No description"}
                      </span>
                    </span>
                    <Badge variant="outline" className={PRIORITY_CONFIG[task.priority].textClass}>
                      {PRIORITY_CONFIG[task.priority].label}
                    </Badge>
                    {selected && <Check className="size-4 text-violet-500" />}
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="relative z-10 shrink-0 border-t bg-background pt-3">
          <span className="mr-auto text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button
            disabled={selectedIds.size === 0}
            onClick={() => {
              onAdd(tasks.filter((task) => selectedIds.has(task.id)));
              handleOpenChange(false);
            }}
          >
            Add {selectedIds.size || ""} to canvas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
