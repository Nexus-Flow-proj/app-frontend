import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
} from "@tanstack/react-query";
import type { ApiResponse, ApiError } from "@/types";

export function useApiQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<ApiResponse<TData>>,
  options?: Omit<
    UseQueryOptions<ApiResponse<TData>, ApiError, TData>,
    "queryKey" | "queryFn" | "select"
  >,
): UseQueryResult<TData, ApiError> {
  return useQuery<ApiResponse<TData>, ApiError, TData>({
    queryKey,
    queryFn,
    select: (res) => res.data,
    ...options,
  });
}
