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

export default useFilterParams;
