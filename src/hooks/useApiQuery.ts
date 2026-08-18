import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
} from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { isSessionInvalid } from "@/lib/api/session";
import type { ApiResponse, ApiError } from "@/types";

function isAuthSessionQuery(queryKey: QueryKey): boolean {
  return (
    queryKey.length === QUERY_KEYS.auth.me.length &&
    queryKey.every((part, index) => part === QUERY_KEYS.auth.me[index])
  );
}

export function useApiQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<ApiResponse<TData>>,
  options?: Omit<
    UseQueryOptions<ApiResponse<TData>, ApiError, TData>,
    "queryKey" | "queryFn" | "select"
  >,
): UseQueryResult<TData, ApiError> {
  const enabled = options?.enabled ?? true;
  const shouldRunQuery =
    enabled && (!isSessionInvalid() || isAuthSessionQuery(queryKey));

  return useQuery<ApiResponse<TData>, ApiError, TData>({
    queryKey,
    queryFn,
    select: (res) => res.data,
    ...options,
    enabled: shouldRunQuery,
  });
}
