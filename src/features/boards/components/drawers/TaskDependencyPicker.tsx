import { useMemo, useState } from "react";
import {
  GitBranch,
  Plus,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../../constants";
import type { BoardColumn, Task, TaskDetail, TaskId } from "../../types";

interface TaskDependencyPickerProps {
  task: TaskDetail;
  tasks: Task[];
  columns: BoardColumn[];
  isUpdating?: boolean;
  onChangeDependencies: (taskId: TaskId, dependencyIds: TaskId[]) => void;
}

interface DependencyCandidate {
  task: Task;
  columnName: string;
  isSelected: boolean;
  isBlockedByDirectCycle: boolean;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function formatTaskCode(taskId: string) {
  return `TASK-${taskId.slice(0, 6).toUpperCase()}`;
}

export function TaskDependencyPicker({
  task,
  tasks,
  columns,
  isUpdating,
  onChangeDependencies,
}: TaskDependencyPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dependencyIds = task.dependencyIds ?? [];
  const dependencyIdSet = useMemo(
    () => new Set(dependencyIds),
    [dependencyIds],
  );
  const columnNameById = useMemo(
    () => new Map(columns.map((column) => [column.id, column.name])),
    [columns],
  );
  const tasksById = useMemo(
    () => new Map(tasks.map((candidate) => [candidate.id, candidate])),
    [tasks],
  );

  const selectedDependencies = dependencyIds.map((dependencyId) => ({
    id: dependencyId,
    task: tasksById.get(dependencyId),
  }));

  const candidates = useMemo<DependencyCandidate[]>(() => {
    const query = normalizeText(search);

    return tasks
      .filter((candidate) => candidate.id !== task.id)
      .filter((candidate) => {
        if (!query) return true;

        const columnName = columnNameById.get(candidate.boardColumnId ?? "") ?? "";
        const haystack = normalizeText(
          [
            candidate.title,
            candidate.description,
            columnName,
            candidate.assignee?.name,
            candidate.tags?.join(" "),
            formatTaskCode(candidate.id),
          ]
            .filter(Boolean)
            .join(" "),
        );

        return haystack.includes(query);
      })
      .map((candidate) => ({
        task: candidate,
        columnName:
          columnNameById.get(candidate.boardColumnId ?? "") ?? "No column",
        isSelected: dependencyIdSet.has(candidate.id),
        isBlockedByDirectCycle: candidate.dependencyIds.includes(task.id),
      }))
      .sort((a, b) => {
        if (a.isSelected !== b.isSelected) return a.isSelected ? -1 : 1;

        const aSameColumn = a.task.boardColumnId === task.boardColumnId;
        const bSameColumn = b.task.boardColumnId === task.boardColumnId;
        if (aSameColumn !== bSameColumn) return aSameColumn ? -1 : 1;

        const aDueDate = a.task.dueDate ?? "";
        const bDueDate = b.task.dueDate ?? "";
        if (aDueDate && bDueDate && aDueDate !== bDueDate) {
          return aDueDate.localeCompare(bDueDate);
        }
        if (aDueDate !== bDueDate) return aDueDate ? -1 : 1;

        return a.task.title.localeCompare(b.task.title);
      });
  }, [
    columnNameById,
    dependencyIdSet,
    search,
    task.boardColumnId,
    task.id,
    tasks,
  ]);

  const addDependency = (dependencyId: TaskId) => {
    if (dependencyIdSet.has(dependencyId)) return;
    onChangeDependencies(task.id, [...dependencyIds, dependencyId]);
  };

  const removeDependency = (dependencyId: TaskId) => {
    onChangeDependencies(
      task.id,
      dependencyIds.filter((id) => id !== dependencyId),
    );
  };

  return (
    <div className="space-y-2">
      {selectedDependencies.length > 0 ? (
        <div className="space-y-1.5">
          {selectedDependencies.map(({ id, task: dependency }) => (
            <div
              key={id}
              className="flex min-h-9 items-center gap-2 rounded-md border border-border/70 bg-muted/30 px-2 py-1.5"
            >
              <GitBranch className="size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {dependency?.title ?? id}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {dependency
                    ? `${formatTaskCode(dependency.id)} • ${
                        columnNameById.get(dependency.boardColumnId ?? "") ??
                        "No column"
                      }`
                    : "Task is not in the current board cache"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={isUpdating}
                onClick={() => removeDependency(id)}
                aria-label="Remove dependency"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No dependencies
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-full justify-center gap-1.5 text-xs"
        disabled={isUpdating}
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-3.5" />
        Add dependency
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <GitBranch className="size-4 text-muted-foreground" />
              Choose dependencies
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks"
                className="h-9 pl-8 text-sm"
                autoFocus
              />
            </div>

            <ScrollArea className="h-80 rounded-md border border-border/70">
              {candidates.length > 0 ? (
                <div className="divide-y divide-border/70">
                  {candidates.map((candidate) => {
                    const priorityConfig =
                      PRIORITY_CONFIG[candidate.task.priority];
                    const statusConfig = STATUS_CONFIG[candidate.task.status];
                    const isDisabled =
                      isUpdating || candidate.isBlockedByDirectCycle;

                    return (
                      <div
                        key={candidate.task.id}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2.5",
                          candidate.isSelected && "bg-muted/50",
                        )}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-medium">
                              {candidate.task.title}
                            </p>
                            {candidate.isSelected && (
                              <Badge variant="secondary" size="sm">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span>{formatTaskCode(candidate.task.id)}</span>
                            <span>•</span>
                            <span>{candidate.columnName}</span>
                            {candidate.task.assignee && (
                              <>
                                <span>•</span>
                                <span>{candidate.task.assignee.name}</span>
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant="outline"
                              size="sm"
                              className="gap-1 font-normal"
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  priorityConfig.dotClass,
                                )}
                              />
                              {priorityConfig.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              size="sm"
                              className="gap-1 font-normal"
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  statusConfig.dotClass,
                                )}
                              />
                              {statusConfig.label}
                            </Badge>
                            {candidate.isBlockedByDirectCycle && (
                              <Badge
                                variant="destructive"
                                size="sm"
                                className="gap-1 font-normal"
                              >
                                <ShieldAlert className="size-3" />
                                Direct cycle
                              </Badge>
                            )}
                          </div>
                        </div>
                        {candidate.isSelected ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={isUpdating}
                            onClick={() => removeDependency(candidate.task.id)}
                            aria-label="Remove dependency"
                          >
                            <X className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8 shrink-0"
                            disabled={isDisabled}
                            onClick={() => addDependency(candidate.task.id)}
                            aria-label="Add dependency"
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty className="h-80 border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Search className="size-4" />
                    </EmptyMedia>
                    <EmptyTitle>No matching tasks</EmptyTitle>
                    <EmptyDescription>
                      No task matches the current search.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
