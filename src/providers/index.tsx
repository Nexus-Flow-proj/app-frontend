import { StrictMode, type ReactNode } from "react";
import { Toaster } from "sonner";
import ReactQueryProvider from "./ReactQueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return (
    <StrictMode>
      <ReactQueryProvider>
        <Toaster
          richColors
          position="top-right"
          expand={false}
          toastOptions={{ duration: 3500 }}
        />
        <TooltipProvider>{children}</TooltipProvider>
      </ReactQueryProvider>
    </StrictMode>
  );
}

export default Providers;
