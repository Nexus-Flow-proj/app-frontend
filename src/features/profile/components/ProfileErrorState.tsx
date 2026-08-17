import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileErrorStateProps {
  message: string | string[];
  onRetry: () => void;
}

export function ProfileErrorState({ message, onRetry }: ProfileErrorStateProps) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card px-6 py-14 text-center">
      <AlertCircle className="size-8 text-muted-foreground" />
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Couldn&apos;t load your profile
        </h2>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {message}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-3.5" />
        Try again
      </Button>
    </section>
  );
}
