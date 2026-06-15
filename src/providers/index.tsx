import { StrictMode, type ReactNode } from "react";
import { Toaster } from "sonner";
import ReactQueryProvider from "./ReactQueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./ThemeProvider";

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return (
    <StrictMode>
      <ReactQueryProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Toaster
            richColors
            position="top-right"
            expand={false}
            toastOptions={{ duration: 3500 }}
          />
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </StrictMode>
  );
}

export default Providers;
