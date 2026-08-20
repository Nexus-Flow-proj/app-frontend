import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Calendar,
  Clock,
  CreditCard,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routing";
import { useCustomerPortal } from "../hooks/useCustomerPortal";
import { PlanBadge } from "./PlanBadge";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import type { SubscriptionResponseDto } from "../types";

interface BillingOverviewCardProps {
  subscription?: SubscriptionResponseDto | null;
}

export function BillingOverviewCard({
  subscription,
}: BillingOverviewCardProps) {
  const navigate = useNavigate();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const { mutate: openPortal, isPending: isPortalPending } =
    useCustomerPortal();

  const plan = subscription?.plan;
  const tier = plan?.tier ?? "FREE";
  const isFree = tier === "FREE";
  const status = subscription?.status ?? "ACTIVE";
  const isTrialing = status === "TRIALING";
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;

  const trialDaysRemaining =
    isTrialing && subscription?.trialEnd
      ? Math.max(0, differenceInDays(parseISO(subscription.trialEnd), new Date()))
      : null;

  const formattedPeriodEnd = subscription?.currentPeriodEnd
    ? (() => {
        try {
          return format(parseISO(subscription.currentPeriodEnd), "MMMM d, yyyy");
        } catch {
          return subscription.currentPeriodEnd;
        }
      })()
    : null;

  return (
    <>
      <Card className="border-border/80 shadow-none">
        <CardHeader className="p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Active Subscription</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Overview of your current subscription tier and billing settings.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <PlanBadge tier={tier} size="default" />
              {isTrialing && (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-primary text-[11px]"
                >
                  Trial
                </Badge>
              )}
              {cancelAtPeriodEnd && (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px]"
                >
                  Cancels at period end
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-5">
          {/* Trial Alert Banner */}
          {isTrialing && trialDaysRemaining !== null && (
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary dark:text-primary">
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 shrink-0" />
                <span>
                  <strong>{trialDaysRemaining} days remaining</strong> in your {plan?.name} trial.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[11px] bg-background font-normal"
                onClick={() => openPortal()}
                disabled={isPortalPending}
              >
                Manage Card
              </Button>
            </div>
          )}

          {/* Cancellation Notice Banner */}
          {cancelAtPeriodEnd && formattedPeriodEnd && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              Your subscription will cancel on{" "}
              <strong>{formattedPeriodEnd}</strong>. After this date, your account will revert to the Free tier.
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">Current Plan</p>
              <p className="mt-1 font-semibold text-foreground text-sm">
                {plan?.name ?? "Free Tier"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isFree
                  ? "Free forever"
                  : subscription?.billingInterval === "ANNUAL"
                    ? "Billed annually"
                    : "Billed monthly"}
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                {cancelAtPeriodEnd ? "Access Ends" : "Next Billing Date"}
              </p>
              <p className="mt-1 font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <span>{formattedPeriodEnd ?? "N/A"}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isFree ? "No renewal" : cancelAtPeriodEnd ? "No auto-renewal" : "Auto-renews"}
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">Payment Method</p>
              <p className="mt-1 font-semibold text-foreground text-sm flex items-center gap-1.5">
                <CreditCard className="size-3.5 text-muted-foreground shrink-0" />
                <span>{isFree ? "None Required" : "Stripe Billing"}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isFree ? "No card on file" : "Securely stored on Stripe"}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {isFree ? (
              <Button
                className="text-xs font-medium"
                onClick={() => navigate(ROUTES.PRICING)}
              >
                Upgrade to Pro
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium"
                  onClick={() => navigate(ROUTES.PRICING)}
                >
                  Change Plan
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium gap-1.5"
                  onClick={() => openPortal()}
                  disabled={isPortalPending}
                >
                  {isPortalPending ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      Opening portal...
                    </>
                  ) : (
                    <>
                      <span>Billing Portal</span>
                      <ExternalLink className="size-3 opacity-60" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {!isFree && !cancelAtPeriodEnd && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancel subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CancelSubscriptionDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        currentPeriodEnd={subscription?.currentPeriodEnd}
        tierName={plan?.name}
      />
    </>
  );
}
