import { useState, type ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  DEFAULT_STALE_TIME,
  DEFAULT_GC_TIME,
  DEFAULT_RETRY,
} from "@/constants";
// Load ReactQueryDevtools dynamically in development to avoid bundling in production

interface ReactQueryProviderProps {
  children: ReactNode;
}

export default function ReactQueryProvider({
  children,
}: ReactQueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
      }),
  );

  const [Devtools, setDevtools] = useState<null | React.ComponentType<any>>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    void import("@tanstack/react-query-devtools").then((m) => setDevtools(() => m.ReactQueryDevtools));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {Devtools ? <Devtools initialIsOpen={false} /> : null}
      {children}
    </QueryClientProvider>
  );
}
