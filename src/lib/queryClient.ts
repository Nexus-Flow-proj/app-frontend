import { QueryClient } from "@tanstack/react-query";
import {
  DEFAULT_GC_TIME,
  DEFAULT_RETRY,
  DEFAULT_STALE_TIME,
} from "@/constants";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      retry: DEFAULT_RETRY,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: DEFAULT_RETRY,
    },
  },
});
