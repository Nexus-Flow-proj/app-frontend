import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpgradeModalStore } from "@/store/upgradeModalStore";
import { usePlans } from "../hooks/usePlans";
import { useMySubscription } from "../hooks/useMySubscription";
import { useCreateCheckout } from "../hooks/useCreateCheckout";
import { PricingCard } from "./PricingCard";
import type { BillingInterval, PlanDto, PlanTier } from "../types";

export function PricingComparisonModal() {
  const isOpen = useUpgradeModalStore((s) => s.isPricingModalOpen);
  const closePricingModal = useUpgradeModalStore((s) => s.closePricingModal);

  const [interval, setInterval] = useState<BillingInterval>("MONTHLY");
  const [selectedTierForCheckout, setSelectedTierForCheckout] =
    useState<string | null>(null);

  const { data: plansResponse, isLoading: isPlansLoading } = usePlans();
  const { data: subResponse } = useMySubscription();
  const { mutate: createCheckout, isPending: isCheckoutPending } =
    useCreateCheckout();

  const currentPlanTier: PlanTier = subResponse?.plan?.tier ?? "FREE";
  const plans: PlanDto[] = plansResponse ?? [];

  const handleSelectPlan = (
    tier: "PRO" | "BUSINESS",
    selectedInterval: BillingInterval,
  ) => {
    setSelectedTierForCheckout(tier);
    createCheckout({
      tier,
      interval: selectedInterval,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePricingModal()}>
      <DialogContent className="max-h-[90vh] w-full max-w-5xl overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Choose the Perfect Plan for Your Team
          </DialogTitle>
          <DialogDescription className="mx-auto max-w-md text-xs sm:text-sm text-muted-foreground mt-1">
            Simple, transparent pricing tailored for teams of all sizes. Switch or cancel anytime.
          </DialogDescription>

          {/* Billing Interval Toggle */}
          <div className="mt-5 flex items-center justify-center">
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
        </DialogHeader>

        {isPlansLoading ? (
          <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-3">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-3 items-stretch">
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
        )}
      </DialogContent>
    </Dialog>
  );
}
