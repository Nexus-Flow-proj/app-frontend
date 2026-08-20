import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import Loading from "@/components/shared/loading/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routing";
import { usePlans } from "../hooks/usePlans";
import { useMySubscription } from "../hooks/useMySubscription";
import { useCreateCheckout } from "../hooks/useCreateCheckout";
import { PricingCard } from "../components/PricingCard";
import type { BillingInterval, PlanDto, PlanTier } from "../types";

export default function PricingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [interval, setInterval] = useState<BillingInterval>("MONTHLY");
  const [selectedTierForCheckout, setSelectedTierForCheckout] =
    useState<string | null>(null);

  const { data: plansResponse, isLoading } = usePlans();
  const { data: subResponse } = useMySubscription();
  const { mutate: createCheckout, isPending: isCheckoutPending } =
    useCreateCheckout();

  const currentPlanTier: PlanTier = subResponse?.plan?.tier ?? "FREE";
  const plans: PlanDto[] = plansResponse ?? [];

  const handleSelectPlan = (
    tier: "PRO" | "BUSINESS",
    selectedInterval: BillingInterval,
  ) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    setSelectedTierForCheckout(tier);
    createCheckout({
      tier,
      interval: selectedInterval,
    });
  };

  if (isLoading) {
    return <Loading text="Loading pricing plans..." />;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Choose the Perfect Plan for Your Team
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Simple, transparent pricing tailored for teams of all sizes. Switch or cancel anytime.
        </p>

        {/* Interval Switcher */}
        <div className="mt-6 flex items-center justify-center">
          <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setInterval("MONTHLY")}
              className={`rounded-md px-3.5 py-1 text-xs font-medium transition-all ${
                interval === "MONTHLY"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval("ANNUAL")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1 text-xs font-medium transition-all ${
                interval === "ANNUAL"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual</span>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-1.5 py-0 text-[10px] font-medium"
              >
                Save 20%
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-16 items-stretch">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            interval={interval}
            currentPlanTier={currentPlanTier}
            onSelectPlan={handleSelectPlan}
            isPending={isCheckoutPending}
            selectedTierForCheckout={selectedTierForCheckout}
          />
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto mt-16 pt-10 border-t border-border">
        <h2 className="text-lg font-semibold tracking-tight text-center mb-6">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          <Card className="border-border/70 shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-foreground">
                How does project-level privilege work?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              When a Free user is invited to a project owned by a Pro or Business admin, that project unlocks Pro or Business capabilities (such as custom roles, unlimited columns, and high task limits). In projects owned by a Business admin, all members also receive unlimited AI generations.
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-foreground">
                Can I cancel or change plans anytime?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Yes. You can manage your subscription, switch intervals, or schedule a cancellation at any time directly through the Stripe customer billing portal. If you cancel, your paid access continues until the end of your billing cycle.
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-foreground">
                Does the Pro plan include a free trial?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Yes, new Pro subscriptions include a 14-day free trial so you can explore the AI mind-mapping tools, board assistant chats, and custom RBAC workflows before being charged.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
