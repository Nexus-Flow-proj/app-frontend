import type { PlanTier } from "../types";

export const PLAN_TIERS: Record<PlanTier, PlanTier> = {
  FREE: "FREE",
  PRO: "PRO",
  BUSINESS: "BUSINESS",
};

export const PLAN_DISPLAY_NAMES: Record<PlanTier, string> = {
  FREE: "Free",
  PRO: "Pro",
  BUSINESS: "Business",
};

export const PLAN_BADGE_VARIANTS: Record<
  PlanTier,
  { label: string; className: string }
> = {
  FREE: {
    label: "Free",
    className: "bg-muted text-muted-foreground border-border",
  },
  PRO: {
    label: "Pro",
    className:
      "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-sm",
  },
  BUSINESS: {
    label: "Business",
    className:
      "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-sm",
  },
};

export const BILLING_INTERVALS = {
  MONTHLY: "MONTHLY",
  ANNUAL: "ANNUAL",
} as const;

export const ANNUAL_DISCOUNT_PERCENTAGE = 20;

export const FREE_AI_MONTHLY_LIMIT = 3;
export const PRO_AI_LIMITS = {
  onboarding: 6,
  chat: 40,
  tasks: 20,
};
