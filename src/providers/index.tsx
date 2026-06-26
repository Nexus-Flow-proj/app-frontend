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
            expand={true}
            position="top-right"
            toastOptions={{ duration: 3500 }}
            closeButton
          />
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </StrictMode>
  );
}

export default Providers;
