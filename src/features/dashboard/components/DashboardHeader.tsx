import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardUpdatedLabel } from "./DashboardUpdatedLabel";

interface DashboardHeaderProps {
  firstName?: string;
  updatedAt: number;
  onRefresh: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader({
  firstName,
  updatedAt,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {getGreeting()}, {firstName || "there"}!
        </h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Here's what's happening with your work today.
        </p>
      </div>

      {updatedAt > 0 && (
        <div className="flex items-center gap-2">
          <DashboardUpdatedLabel updatedAt={updatedAt} />
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      )}
    </header>
  );
}
