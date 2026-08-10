import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { Task, TaskList } from "../types";
import { QUERY_KEYS } from "@/constants";

// ── Helpers ──────────────────────────────────────────────────────────

function getListKey(projectId: string) {
  return QUERY_KEYS.tasks.list(projectId);
}

function isTaskListQueryKey(queryKey: QueryKey) {
    return queryKey[0] === "tasks" && queryKey[1] === "list";
}

export type TaskListCacheSnapshot = Array<[QueryKey, TaskList | undefined]>;

function sortTasksByBoardPosition(tasks: Task[]) {
    return [...tasks].sort((a, b) => {
        const columnCompare = (a.boardColumnId ?? "").localeCompare(
            b.boardColumnId ?? "",
        );

        if (columnCompare !== 0) return columnCompare;

        return (a.columnOrder ?? 0) - (b.columnOrder ?? 0);
    });
}

function isOptimisticId(id: string) {
    return id.startsWith("temp-");
}

function isMatchingOptimisticTask(task: Task, newTask: Task) {
    return (
        isOptimisticId(task.id) &&
        task.title === newTask.title &&
        task.boardColumnId === newTask.boardColumnId
    );
}

// ── Add ──────────────────────────────────────────────────────────────

export function addTaskToListCache(
  qc: QueryClient,
  projectId: string,
  newTask: Task,
) {
  qc.setQueryData<TaskList>(getListKey(projectId), (old) => {
    if (!old) return old;
    const existed = old.tasks.some((task) => task.id === newTask.id);
    if (existed) return old;
    const optimisticTask = old.tasks.find((task) =>
      isMatchingOptimisticTask(task, newTask),
    );

    if (optimisticTask) {
      return {
        ...old,
        tasks: sortTasksByBoardPosition(
          old.tasks.map((task) =>
            task.id === optimisticTask.id
              ? {
                  ...newTask,
                  boardColumnId:
                    optimisticTask.boardColumnId ?? newTask.boardColumnId,
                  columnOrder: optimisticTask.columnOrder,
                }
              : task,
          ),
        ),
      };
    }

    return {
      ...old,
      tasks: sortTasksByBoardPosition([...old.tasks, newTask]),
      total: old.total + 1,
    };
  });
}

export async function addOptimisticTaskToListCache(
    qc: QueryClient,
    projectId: string,
    newTask: Task,
) {
    await qc.cancelQueries({ queryKey: getListKey(projectId) });

    const previousTaskList = qc.getQueryData<TaskList>(
        getListKey(projectId),
    );

    addTaskToListCache(qc, projectId, newTask);

    return { previousTaskList };
}

export async function addOptimisticTaskToColumnStartCache(
    qc: QueryClient,
    projectId: string,
    newTask: Task,
) {
    await qc.cancelQueries({ queryKey: getListKey(projectId) });

    const previousTaskList = qc.getQueryData<TaskList>(
        getListKey(projectId),
    );

    qc.setQueryData<TaskList>(
        getListKey(projectId),
        (old) => {
            if (!old) return old;

            const shiftedTasks = old.tasks.map((task) =>
                task.boardColumnId === newTask.boardColumnId
                    ? {
                        ...task,
                        columnOrder: (task.columnOrder ?? 0) + 1,
                    }
                    : task,
            );

            return {
                ...old,
                tasks: sortTasksByBoardPosition([
                    ...shiftedTasks,
                    { ...newTask, columnOrder: 0 },
                ]),
                total: old.total + 1,
            };
        },
    );

    return { previousTaskList };
}

export function replaceTaskInListCache(
    qc: QueryClient,
    projectId: string,
    taskId: string,
    replacement: Task,
) {
    qc.setQueryData<TaskList>(
        getListKey(projectId),
        (old) => {
            if (!old) return old;

            return {
                ...old,
                tasks: sortTasksByBoardPosition(
                    old.tasks.map((task) =>
                        task.id === taskId ? replacement : task,
                    ),
                ),
            };
        },
    );
}

export function replaceCreatedTaskInListCache(
    qc: QueryClient,
    projectId: string,
    tempTaskId: string,
    replacement: Task,
) {
    qc.setQueryData<TaskList>(
        getListKey(projectId),
        (old) => {
            if (!old) return old;

            return {
                ...old,
                tasks: sortTasksByBoardPosition(
                    old.tasks.map((task) =>
                        task.id === tempTaskId
                            ? {
                                ...replacement,
                                boardColumnId:
                                    task.boardColumnId ??
                                    replacement.boardColumnId,
                                columnOrder: task.columnOrder,
                            }
                            : task,
                    ),
                ),
            };
        },
    );
}

export function patchTaskInListCache(
    qc: QueryClient,
    projectId: string,
    taskId: string,
    applyUpdate: (task: Task) => Task,
) {
    qc.setQueryData<TaskList>(
        getListKey(projectId),
        (old) => {
            if (!old) return old;

            return {
                ...old,
                tasks: sortTasksByBoardPosition(
                    old.tasks.map((task) =>
                        task.id === taskId
                            ? applyUpdate(task)
                            : task,
                    ),
                ),
            };
        },
    );
}

export function patchTaskInAllListCaches(
    qc: QueryClient,
    taskId: string,
    applyUpdate: (task: Task) => Task,
) {
    qc.getQueryCache()
        .findAll({ queryKey: QUERY_KEYS.tasks.all })
        .filter((query) => isTaskListQueryKey(query.queryKey))
        .forEach((query) => {
            qc.setQueryData<TaskList>(
                query.queryKey,
                (old) => {
                    if (!old) return old;

                    return {
                        ...old,
                        tasks: sortTasksByBoardPosition(
                            old.tasks.map((task) =>
                                task.id === taskId ? applyUpdate(task) : task,
                            ),
                        ),
                    };
                },
            );
        });
}

export function snapshotTaskListCaches(
    qc: QueryClient,
): TaskListCacheSnapshot {
    return qc.getQueryCache()
        .findAll({ queryKey: QUERY_KEYS.tasks.all })
        .filter((query) => isTaskListQueryKey(query.queryKey))
        .map((query) => [
            query.queryKey,
            query.state.data as TaskList | undefined,
        ]);
}

export function rollbackTaskListCaches(
    qc: QueryClient,
    snapshot: TaskListCacheSnapshot | undefined,
) {
    snapshot?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data);
    });
}

export function invalidateTaskListCaches(qc: QueryClient) {
    qc.getQueryCache()
        .findAll({ queryKey: QUERY_KEYS.tasks.all })
        .filter((query) => isTaskListQueryKey(query.queryKey))
        .forEach((query) => {
            qc.invalidateQueries({ queryKey: query.queryKey });
        });
}

export function removeOptimisticCreatedTaskFromListCache(
    qc: QueryClient,
    projectId: string,
    tempTaskId: string,
) {
    qc.setQueryData<TaskList>(
        getListKey(projectId),
        (old) => {
            if (!old) return old;

            const failedTask = old.tasks.find((task) => task.id === tempTaskId);
            if (!failedTask) return old;

            const failedOrder = failedTask.columnOrder ?? 0;
            const failedColumnId = failedTask.boardColumnId;

            return {
                ...old,
                tasks: sortTasksByBoardPosition(
                    old.tasks
                        .filter((task) => task.id !== tempTaskId)
                        .map((task) =>
                            task.boardColumnId === failedColumnId &&
                                (task.columnOrder ?? 0) > failedOrder
                                ? {
                                    ...task,
                                    columnOrder: Math.max(
                                        (task.columnOrder ?? 0) - 1,
                                        0,
                                    ),
                                }
                                : task,
                        ),
                ),
                total: Math.max(old.total - 1, 0),
            };
        },
    );
}

// ── Remove (optimistic) ─────────────────────────────────────────────

export async function removeTaskFromListCache(
  qc: QueryClient,
  projectId: string,
  taskId: string,
) {
  await qc.cancelQueries({ queryKey: getListKey(projectId) });

  const previousTaskList = qc.getQueryData<TaskList>(getListKey(projectId));

  qc.setQueryData<TaskList>(getListKey(projectId), (old) => {
    if (!old) return;
    const newTasksAfterDeletion = old.tasks.filter(
      (task) => task.id !== taskId,
    );
    return {
      ...old,
      tasks: newTasksAfterDeletion,
      total: old.total - 1,
    };
  });

  return { previousTaskList };
}

// ── Update (optimistic) ─────────────────────────────────────────────

export async function updateTaskInListCache(
  qc: QueryClient,
  projectId: string,
  taskId: string,
  applyUpdate: (task: Task) => Task,
) {
  await qc.cancelQueries({ queryKey: getListKey(projectId) });

  const previousTaskList = qc.getQueryData<TaskList>(getListKey(projectId));

  qc.setQueryData<TaskList>(getListKey(projectId), (old) => {
    if (!old) return old;

    return {
      ...old,
      tasks: sortTasksByBoardPosition(
        old.tasks.map((task) =>
          task.id === taskId ? applyUpdate(task) : task,
        ),
      ),
    };
  });

  return { previousTaskList };
}

// ── Rollback ────────────────────────────────────────────────────────

export function rollbackTaskList(
  qc: QueryClient,
  projectId: string,
  previousTaskList: TaskList | undefined,
) {
  qc.setQueryData(getListKey(projectId), previousTaskList);
}
// Invalidate

export function invalidateTaskList(qc: QueryClient, projectId: string) {
  qc.invalidateQueries({ queryKey: getListKey(projectId) });
}
