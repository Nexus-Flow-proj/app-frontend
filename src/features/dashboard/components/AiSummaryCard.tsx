import { Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiSummary } from "../hooks/useAiSummary";
import { DashboardCard } from "./DashboardCard";

export function AiSummaryCard() {
  const { data, isLoading, error, hasRequested, generate } = useAiSummary();

  // Nothing requested yet - show a lightweight prompt instead of calling
  // the (expensive) AI endpoint for every visitor automatically.
  if (!hasRequested) {
    return (
      <DashboardCard
        className="border-dashed border-primary/30 bg-primary/5"
        contentClassName="flex items-center justify-between gap-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Get an AI summary of your workload
            </p>
            <p className="text-sm text-muted-foreground">
              A quick read of your current tasks and priorities.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={generate} className="shrink-0">
          Generate
        </Button>
      </DashboardCard>
    );
  }

  if (isLoading || (!data && !error)) {
    return <Skeleton className="h-28 rounded-lg" />;
  }

  // Requested but failed - offer a retry instead of silently disappearing,
  // since the user explicitly asked for this.
  if (error || !data) {
    return (
      <DashboardCard
        className="border-dashed border-destructive/30 bg-destructive/5"
        contentClassName="flex items-center justify-between gap-4"
      >
        <p className="text-sm text-muted-foreground">
          Couldn't generate a summary right now.
        </p>
        <Button size="sm" variant="outline" onClick={generate}>
          Try again
        </Button>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {data.headline}
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Beta
            </span>
          </div>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {data.quickInsight}
          </p>

          {data.focusRecommendation && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-card px-3 py-2.5">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm leading-6 text-muted-foreground">
                {data.focusRecommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}