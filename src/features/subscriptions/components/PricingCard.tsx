import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BillingInterval, PlanDto, PlanTier } from "../types";

interface PricingCardProps {
  plan: PlanDto;
  interval: BillingInterval;
  currentPlanTier?: PlanTier;
  onSelectPlan?: (tier: "PRO" | "BUSINESS", interval: BillingInterval) => void;
  isPending?: boolean;
  selectedTierForCheckout?: string | null;
}

export function PricingCard({
  plan,
  interval,
  currentPlanTier = "FREE",
  onSelectPlan,
  isPending = false,
  selectedTierForCheckout = null,
}: PricingCardProps) {
  const isCurrentPlan = currentPlanTier === plan.tier;
  const isPro = plan.tier === "PRO";
  const isFree = plan.tier === "FREE";

  const isCheckoutLoading =
    isPending && selectedTierForCheckout === plan.tier;

  const monthlyPrice = plan.priceMonthlyUsdCents / 100;
  const annualPrice = plan.priceAnnualUsdCents / 100;
  const displayMonthlyPrice =
    interval === "ANNUAL" ? (annualPrice / 12).toFixed(2) : monthlyPrice.toFixed(0);

  const getFeatureList = () => {
    if (isFree) {
      return [
        "Up to 3 owned projects",
        "5 team members per project",
        "100 tasks per project",
        "3 Kanban board columns",
        "3 monthly AI planning requests",
        "Real-time mind mapping canvas",
        "7-day activity history",
      ];
    }
    if (isPro) {
      return [
        "Up to 5 owned projects",
        "5 team members per project",
        "2,000 tasks per project",
        "Unlimited board columns",
        "6 AI Onboarding Mindmaps / mo",
        "40 AI Board Chats / mo",
        "20 AI Task Automations / mo",
        "Knowledge Base (40 chunks / proj)",
        "Custom RBAC roles & permissions",
        "90-day activity history",
        "14-day free trial included",
      ];
    }
    return [
      "Unlimited projects & team members",
      "Unlimited tasks & board columns",
      "Unlimited AI generations & chats",
      "Unlimited Knowledge Base storage",
      "Custom RBAC roles & permissions",
      "Real-time sync across workspaces",
      "365-day activity history",
      "Priority customer support",
    ];
  };

  return (
    <Card
      className={`relative flex flex-col justify-between rounded-xl border bg-card p-1 transition-all ${
        isPro
          ? "border-primary/60 shadow-sm ring-1 ring-primary/20 dark:border-primary/70"
          : "border-border/80"
      }`}
    >
      <div>
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {plan.name}
            </h3>
            {isCurrentPlan ? (
              <Badge variant="outline" className="border-border bg-muted text-[11px] font-normal text-muted-foreground">
                Current Plan
              </Badge>
            ) : isPro ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] font-medium hover:bg-primary/10">
                Most Popular
              </Badge>
            ) : null}
          </div>

          <p className="mt-1.5 min-h-[36px] text-xs leading-relaxed text-muted-foreground">
            {plan.description}
          </p>

          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              ${displayMonthlyPrice}
            </span>
            <span className="text-xs text-muted-foreground">/ month</span>
          </div>

          <div className="mt-1 text-[11px] text-muted-foreground">
            {isFree ? (
              <span>Free for individual builders</span>
            ) : interval === "ANNUAL" ? (
              <span>Billed annually (${annualPrice}/yr)</span>
            ) : (
              <span>Billed monthly</span>
            )}
          </div>
        </CardHeader>

        <Separator className="mx-6 w-auto" />

        <CardContent className="p-6 pt-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3.5">
            Features included
          </p>
          <ul className="space-y-2.5">
            {getFeatureList().map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90 leading-snug">
                <Check className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>

      <CardFooter className="p-6 pt-2">
        {isFree ? (
          <Button
            variant="outline"
            className="w-full text-xs font-medium"
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? "Active Plan" : "Get Started"}
          </Button>
        ) : isCurrentPlan ? (
          <Button variant="outline" className="w-full text-xs font-medium" disabled>
            Active Plan
          </Button>
        ) : (
          <Button
            variant={isPro ? "default" : "outline"}
            className="w-full text-xs font-medium shadow-none"
            disabled={isPending}
            onClick={() =>
              onSelectPlan?.(
                plan.tier as "PRO" | "BUSINESS",
                interval,
              )
            }
          >
            {isCheckoutLoading ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                Connecting to checkout...
              </>
            ) : isPro ? (
              "Upgrade to Pro"
            ) : (
              "Upgrade to Business"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
