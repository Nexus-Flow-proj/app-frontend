import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routing";
import { useUpgradeModalStore } from "@/store/upgradeModalStore";
import { useCreateCheckout } from "../hooks/useCreateCheckout";
import type { PlanTier } from "../types";

function getUpgradeTitle(code?: string, requiredPlan: PlanTier = "PRO"): string {
  switch (code) {
    case "PROJECT_LIMIT_REACHED":
      return "Project limit reached";
    case "MEMBER_LIMIT_REACHED":
      return "Member limit reached";
    case "TASK_LIMIT_REACHED":
      return "Task limit reached";
    case "COLUMN_LIMIT_REACHED":
      return "Board column limit reached";
    case "CUSTOM_ROLES_NOT_ALLOWED":
      return "Custom roles required";
    case "KNOWLEDGE_BASE_NOT_ALLOWED":
      return "Knowledge Base is a Pro feature";
    case "KNOWLEDGE_CHUNK_LIMIT_REACHED":
      return "Knowledge Base limit reached";
    case "AI_FREE_QUOTA_EXCEEDED":
      return "Monthly AI quota exceeded";
    case "AI_ONBOARDING_QUOTA_EXCEEDED":
    case "AI_CHAT_QUOTA_EXCEEDED":
    case "AI_TASK_QUOTA_EXCEEDED":
      return "AI quota limit reached";
    default:
      return `${requiredPlan === "BUSINESS" ? "Business" : "Pro"} plan required`;
  }
}

export function UpgradePromptModal() {
  const isOpen = useUpgradeModalStore((s) => s.isUpgradePromptOpen);
  const payload = useUpgradeModalStore((s) => s.upgradePromptPayload);
  const closeUpgradePrompt = useUpgradeModalStore((s) => s.closeUpgradePrompt);

  const { mutate: createCheckout, isPending: isCheckoutPending } =
    useCreateCheckout();

  if (!payload) return null;

  const targetPlan: PlanTier = payload.requiredPlan || "PRO";

  const handleDirectUpgrade = () => {
    createCheckout({
      tier: targetPlan as "PRO" | "BUSINESS",
      interval: "MONTHLY",
    });
  };

  const handleOpenPricing = async () => {
    closeUpgradePrompt();
    try {
      const { default: router } = await import("@/router");
      await router.navigate(ROUTES.PRICING);
    } catch {
      window.location.href = ROUTES.PRICING;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeUpgradePrompt()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="text-left sm:text-left space-y-1.5">
          <DialogTitle className="text-base font-semibold text-foreground">
            {getUpgradeTitle(payload.code, targetPlan)}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {payload.message ||
              `You have reached a limit on your current plan. Upgrade to ${targetPlan} to continue.`}
          </DialogDescription>
        </DialogHeader>

        {/* Limit Details Card */}
        {payload.limit !== undefined && payload.limit !== null && (
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground capitalize">
                {payload.limitType ? `${payload.limitType} limit` : "Plan limit"}
              </span>
              <span className="font-medium text-foreground">
                {payload.current ?? payload.limit} / {payload.limit} used
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground pt-1.5 border-t border-border/50">
              <span>Required tier</span>
              <Badge
                variant="outline"
                className="text-[11px] font-medium border-primary/30 bg-primary/10 text-primary"
              >
                {targetPlan}
              </Badge>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground leading-relaxed">
          Upgrading unlocks higher capacity, advanced AI planning tools, and custom agile workflows for your team.
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenPricing}
            className="text-xs font-medium"
          >
            Compare Plans
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-xs font-medium"
            onClick={handleDirectUpgrade}
            disabled={isCheckoutPending}
          >
            {targetPlan === "BUSINESS" ? "Upgrade to Business ($150/mo)" : "Upgrade to Pro ($12/mo)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
