import { Bot, Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDashboardAiSummary } from "../hooks/useDashboardAiSummary";
import { DashboardCard } from "./DashboardCard";

interface AiSummaryCardProps {
  isDashboardLoading?: boolean;
  className?: string;
}

export function AiSummaryCard({
  isDashboardLoading = false,
  className,
}: AiSummaryCardProps) {
  const { data, isLoading, error, refetch } = useDashboardAiSummary();
  const showSkeleton = !error && isDashboardLoading;

  if (showSkeleton) {
    return <Skeleton className={cn("h-72 rounded-lg", className)} />;
  }

  return (
    <DashboardCard
      title="AI priority brief"
      action={
        <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary sm:flex">
          <Sparkles className="size-3.5" />
          On demand
        </span>
      }
      className={cn(
        "overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5",
        className,
      )}
      contentClassName="space-y-4"
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : !data ? (
        <div className="flex min-h-48 flex-col justify-center gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Bot className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-6 text-foreground">
                Generate a focus brief when you need it.
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The dashboard will only call the AI summary endpoint after you
                ask for a fresh recommendation.
              </p>
            </div>
          </div>
          <Button className="w-fit gap-2" onClick={() => refetch()}>
            <Sparkles className="size-4" />
            Generate brief
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Bot className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-6 text-foreground">
                {data.headline}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {data.quickInsight}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/70 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Lightbulb className="size-4 text-amber-500" />
              Recommended focus
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {data.focusRecommendation}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
          >
            <Sparkles className="size-3.5" />
            Refresh brief
          </Button>
        </>
      )}
    </DashboardCard>
  );
}
