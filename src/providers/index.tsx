import { StrictMode, type ReactNode } from "react";
import { Toaster } from "sonner";
import ReactQueryProvider from "./ReactQueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./ThemeProvider";
import RealTimeProvider from "./RealtimeProvider";

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return (
    <StrictMode>
      <ReactQueryProvider>
        <RealTimeProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Toaster
              richColors
              expand={true}
              position="top-right"
              toastOptions={{ duration: 3500 }}
              closeButton
            />
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </RealTimeProvider>
      </ReactQueryProvider>
    </StrictMode>
  );
}

export default Providers;
