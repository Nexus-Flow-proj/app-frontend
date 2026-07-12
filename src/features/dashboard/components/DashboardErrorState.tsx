import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorStateProps {
  message: string | string[];
  onRetry: () => void;
}

export function DashboardErrorState({
  message,
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card px-6 py-14 text-center">
      <AlertCircle className="size-8 text-muted-foreground" />
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Couldn't load your dashboard
        </h2>
        {Array.isArray(message) ? (
          <ul className="max-w-sm space-y-1 text-sm leading-6 text-muted-foreground">
            {message.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            {message}
          </p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-3.5" />
        Try again
      </Button>
    </section>
  );
}
