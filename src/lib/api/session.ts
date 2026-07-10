import type { Query, QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import type { ApiResponse } from "@/types";

let sessionInvalid = false;

const EMPTY_AUTH_SESSION: ApiResponse<null> = {
  success: false,
  message: "Session ended",
  statusCode: 401,
  data: null,
};

function isAuthSessionQuery(query: Query): boolean {
  const [scope, name] = query.queryKey;
  return scope === "auth" && name === "me";
}

export function isSessionInvalid(): boolean {
  return sessionInvalid;
}

export function markSessionActive(): void {
  sessionInvalid = false;
}

export async function clearSessionCache(queryClient: QueryClient): Promise<void> {
  sessionInvalid = true;
  await queryClient.cancelQueries();
  queryClient.removeQueries({
    predicate: (query) => !isAuthSessionQuery(query),
  });
  queryClient.setQueryData(QUERY_KEYS.auth.me, EMPTY_AUTH_SESSION, {
    updatedAt: 0,
  });
}
