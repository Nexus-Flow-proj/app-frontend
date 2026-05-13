import { useSearchParams } from "react-router";
import { useCallback } from "react";

type ParamValue = string | null;

export function useSearchParam(
  key: string,
): [string | null, (value: ParamValue) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key);

  const setValue = useCallback(
    (newValue: ParamValue) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newValue === null || newValue === "") {
            next.delete(key);
          } else {
            next.set(key, newValue);
          }
          return next;
        },
        { replace: true },
      );
    },
    [key, setSearchParams],
  );

  return [value, setValue];
}

/**

// WorkshopPage — track which task drawer is open
const [taskId, setTaskId] = useSearchParam("taskId");

// open drawer
setTaskId("task-abc-123");

// close drawer
setTaskId(null);

 */
