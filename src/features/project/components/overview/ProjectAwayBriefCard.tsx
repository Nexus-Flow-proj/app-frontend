import { formatDistanceStrict } from "date-fns";
import {
  AlertTriangleIcon,
  BotIcon,
  CircleCheckIcon,
  Clock3Icon,
  FileTextIcon,
  Loader2Icon,
  ListTodoIcon,
  SparklesIcon,
  UsersRoundIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProjectSummary } from "../../types";

const AWAY_PROMPT_THRESHOLD_MS = 1000 * 60 * 60 * 2;

interface ProjectAwayBriefCardProps {
  lastVisitedAt?: string | null;
  summary?: ProjectSummary;
  isGenerating: boolean;
  onGenerateBrief: () => void;
}

function getAwayState(lastVisitedAt?: string | null) {
  if (!lastVisitedAt) {
    return {
      shouldPrompt: false,
      awayLabel: "No previous visit recorded",
      lastVisitedLabel: "This looks like your first check-in here.",
    };
  }

  const visitedAt = new Date(lastVisitedAt);
  const visitedAtMs = visitedAt.getTime();

  if (Number.isNaN(visitedAtMs)) {
    return {
      shouldPrompt: false,
      awayLabel: "Visit time unavailable",
      lastVisitedLabel: "We could not read the latest visit timestamp.",
    };
  }

  const elapsedMs = Date.now() - visitedAtMs;
  const awayLabel = formatDistanceStrict(visitedAt, new Date(), {
    addSuffix: false,
  });

  return {
    shouldPrompt: elapsedMs >= AWAY_PROMPT_THRESHOLD_MS,
    awayLabel,
    lastVisitedLabel: visitedAt.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function ProjectAwayBriefCard({
  lastVisitedAt,
  summary,
  isGenerating,
  onGenerateBrief,
}: ProjectAwayBriefCardProps) {
  const awayState = getAwayState(lastVisitedAt);

  if (!awayState.shouldPrompt && !summary) {
    return (
      <Card className="h-full rounded-lg">
        <CardContent className="flex h-full min-h-28 items-center justify-center">
          <GenerateSummaryButton
            isGenerating={isGenerating}
            onGenerateBrief={onGenerateBrief}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-lg">
      <CardHeader>
        <CardTitle>
          {awayState.shouldPrompt ? "Project catch-up" : "Project summary"}
        </CardTitle>
        {awayState.shouldPrompt ? (
          <CardDescription>
            Last checked: {awayState.lastVisitedLabel}
          </CardDescription>
        ) : null}
        <CardAction>
          <GenerateSummaryButton
            isGenerating={isGenerating}
            onGenerateBrief={onGenerateBrief}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        {awayState.shouldPrompt ? (
          <div className="grid gap-4 rounded-lg border bg-muted/30 p-5 sm:grid-cols-[auto_1fr]">
            <div className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Clock3Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                You have been away for {awayState.awayLabel}.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ask Nexus Flow for a concise summary before you jump back into
                the board or workshop.
              </p>
            </div>
          </div>
        ) : null}

        {summary ? (
          <div className="space-y-4">
            <Separator />
            <div className="grid gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BotIcon className="size-4 text-primary" />
                AI brief
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <SummarySection
                  icon={CircleCheckIcon}
                  title="Status"
                  description={summary.statusSummary}
                />
                <SummarySection
                  icon={UsersRoundIcon}
                  title="Who is doing what"
                  description={summary.whoIsDoingWhat}
                />
                <SummarySection
                  icon={ListTodoIcon}
                  title="Remaining work"
                  description={summary.remainingTasksSummary}
                />
                <SummaryListSection
                  icon={AlertTriangleIcon}
                  title="Bottlenecks"
                  items={summary.bottlenecks}
                  emptyText="No bottlenecks found."
                  tone="warning"
                />
              </div>

              <SummaryListSection
                icon={FileTextIcon}
                title="Workload warnings"
                items={summary.workloadWarnings}
                emptyText="No workload warnings found."
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface GenerateSummaryButtonProps {
  isGenerating: boolean;
  onGenerateBrief: () => void;
}

function GenerateSummaryButton({
  isGenerating,
  onGenerateBrief,
}: GenerateSummaryButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onGenerateBrief}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <SparklesIcon className="size-4" />
      )}
      Generate summary
    </Button>
  );
}

interface SummarySectionProps {
  icon: typeof CircleCheckIcon;
  title: string;
  description: string;
}

function SummarySection({
  icon: Icon,
  title,
  description,
}: SummarySectionProps) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-primary" />
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

interface SummaryListSectionProps {
  icon: typeof CircleCheckIcon;
  title: string;
  items: string[];
  emptyText: string;
  tone?: "default" | "warning";
}

function SummaryListSection({
  icon: Icon,
  title,
  items,
  emptyText,
  tone = "default",
}: SummaryListSectionProps) {
  const iconClassName =
    tone === "warning" ? "text-amber-600" : "text-primary";

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className={`size-4 ${iconClassName}`} />
        {title}
      </div>
      <div className="mt-3 grid gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <p key={item} className="text-sm leading-6 text-muted-foreground">
              {item}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        )}
      </div>
    </div>
  );
}
