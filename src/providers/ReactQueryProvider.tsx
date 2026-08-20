import { type ReactNode, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface ReactQueryProviderProps {
  children: ReactNode;
}

export default function ReactQueryProvider({
  children,
}: ReactQueryProviderProps) {
  const [Devtools, setDevtools] = useState<null | React.ComponentType<{
    initialIsOpen?: boolean;
  }>>(null);

  useEffect(() => {
    if (!import.meta.env.VITE_IS_DEV_MODE) return;
    void import("@tanstack/react-query-devtools").then((m) =>
      setDevtools(() => m.ReactQueryDevtools),
    );
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {Devtools ? <Devtools initialIsOpen={false} /> : null}
      {children}
    </QueryClientProvider>
  );
}
