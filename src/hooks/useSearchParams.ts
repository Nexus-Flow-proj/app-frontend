//  multi-key version for filter panels
import { useSearchParams } from "react-router";
import { useCallback } from "react";

type ParamMap = Record<string, string | null>;

export function useFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setParams = useCallback(
    (updates: ParamMap) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearAll = useCallback(
    (...keys: string[]) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          keys.forEach((k) => next.delete(k));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const hasActiveFilters = useCallback(
    (...keys: string[]) => keys.some((k) => searchParams.has(k)),
    [searchParams],
  );

  const getParam = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams],
  );

  return { setParam, setParams, clearAll, hasActiveFilters, getParam };
}

/**

// features/boards/components/BoardFilters.tsx
export function BoardFilters() {
  const { setParam, setParams, clearAll, hasActiveFilters, getParam } = useFilterParams();

  const assignee = getParam("assignee");
  const priority = getParam("priority");
  const search = getParam("search");
  const isDirty = hasActiveFilters("assignee", "priority", "search");

  return (
    <div className="flex items-center gap-2">
      <BoardSearchBar
        value={search ?? ""}
        onChange={(val) => setParam("search", val)}
      />

      <Select
        value={assignee ?? ""}
        onValueChange={(val) => setParam("assignee", val)}
      >
        ...
      </Select>

      <Select
        value={priority ?? ""}
        onValueChange={(val) => setParam("priority", val)}
      >
        ...
      </Select>

      {isDirty && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearAll("assignee", "priority", "search")}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}


// Or batch-set multiple params at once (e.g. applying a saved filter preset)
setParams({
  assignee: "user-123",
  priority: "high",
  search: null,   // clears search while setting the others
});

 */
