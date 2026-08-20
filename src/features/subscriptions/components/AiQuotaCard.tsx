import { useNavigate } from "react-router";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routing";
import { FREE_AI_MONTHLY_LIMIT, PRO_AI_LIMITS } from "../constants";
import type { PlanTier, SubscriptionUsageDto } from "../types";

interface AiQuotaCardProps {
  tier?: PlanTier;
  usage?: SubscriptionUsageDto | null;
}

export function AiQuotaCard({ tier = "FREE", usage }: AiQuotaCardProps) {
  const navigate = useNavigate();

  const resetDateText = usage?.aiUsageResetAt
    ? (() => {
        try {
          return format(parseISO(usage.aiUsageResetAt), "MMM d, yyyy");
        } catch {
          return null;
        }
      })()
    : null;

  if (tier === "BUSINESS") {
    return (
      <Card className="border-border/80 shadow-none">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">AI Generations</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Enterprise AI access active
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px]">
              Unlimited
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
            Your Business plan includes <strong>unlimited</strong> AI mindmap generations, board chats, and task automations across all projects.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tier === "PRO") {
    const onboardingUsed = usage?.aiOnboardingGenerationsUsed ?? 0;
    const onboardingMax = PRO_AI_LIMITS.onboarding;
    const onboardingPct = Math.min(100, Math.round((onboardingUsed / onboardingMax) * 100));

    const chatUsed = usage?.aiChatMessagesUsed ?? 0;
    const chatMax = PRO_AI_LIMITS.chat;
    const chatPct = Math.min(100, Math.round((chatUsed / chatMax) * 100));

    const taskUsed = usage?.aiTaskActionsUsed ?? 0;
    const taskMax = PRO_AI_LIMITS.tasks;
    const taskPct = Math.min(100, Math.round((taskUsed / taskMax) * 100));

    return (
      <Card className="border-border/80 shadow-none">
        <CardHeader className="p-6 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">AI Quota Usage</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Monthly allowances refreshed automatically
              </CardDescription>
            </div>
            {resetDateText && (
              <span className="text-[11px] text-muted-foreground">
                Resets {resetDateText}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-foreground/90">Onboarding Mindmaps</span>
              <span className="text-muted-foreground text-[11px]">
                {onboardingUsed} of {onboardingMax} used
              </span>
            </div>
            <Progress value={onboardingPct} className="h-1.5" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-foreground/90">Board Chats</span>
              <span className="text-muted-foreground text-[11px]">
                {chatUsed} of {chatMax} used
              </span>
            </div>
            <Progress value={chatPct} className="h-1.5" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-foreground/90">Task Automations</span>
              <span className="text-muted-foreground text-[11px]">
                {taskUsed} of {taskMax} used
              </span>
            </div>
            <Progress value={taskPct} className="h-1.5" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 p-3 pt-2 pb-2">
            <span className="text-xs text-muted-foreground">Need unlimited AI?</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-primary font-medium"
              onClick={() => navigate(ROUTES.PRICING)}
            >
              Business plan →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Free Tier
  const totalUsed = usage?.aiTotalRequestsUsed ?? 0;
  const totalMax = FREE_AI_MONTHLY_LIMIT;
  const totalPct = Math.min(100, Math.round((totalUsed / totalMax) * 100));
  const isExhausted = totalUsed >= totalMax;

  return (
    <Card className={`border-border/80 shadow-none ${isExhausted ? "border-amber-500/30" : ""}`}>
      <CardHeader className="p-6 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">AI Quota Usage</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Monthly free allowance
            </CardDescription>
          </div>
          {resetDateText && (
            <span className="text-[11px] text-muted-foreground">
              Resets {resetDateText}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-foreground/90">Monthly Requests</span>
            <span className={isExhausted ? "font-medium text-amber-600 dark:text-amber-400 text-[11px]" : "text-muted-foreground text-[11px]"}>
              {totalUsed} of {totalMax} used
            </span>
          </div>
          <Progress
            value={totalPct}
            className={`h-1.5 ${isExhausted ? "[&>div]:bg-amber-500" : ""}`}
          />
        </div>

        {isExhausted ? (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground space-y-2">
            <p className="text-foreground font-medium">
              You have reached your 3 monthly AI requests.
            </p>
            <p className="leading-relaxed">
              Upgrade to Pro to unlock 6 onboarding mindmaps, 40 chats, and 20 task actions each month.
            </p>
            <Button
              size="sm"
              className="w-full text-xs font-medium"
              onClick={() => navigate(ROUTES.PRICING)}
            >
              Upgrade to Pro
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 p-3 pt-2 pb-2 text-xs text-muted-foreground">
            <span>Free quota resets monthly.</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-primary font-medium"
              onClick={() => navigate(ROUTES.PRICING)}
            >
              View Pro plan →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
