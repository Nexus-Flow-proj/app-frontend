export type PlanTier = "FREE" | "PRO" | "BUSINESS";

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE";

export type BillingInterval = "MONTHLY" | "ANNUAL";

export interface PlanFeatures {
  maxProjectsOwned: number | null;
  maxMembersPerProject: number | null;
  maxTasksPerProject: number | null;
  maxBoardColumns: number | null;
  maxKnowledgeChunks: number | null;
  aiOnboardingGenerations: number | null;
  aiChatMessages: number | null;
  aiTaskActions: number | null;
  freeTierAiRequestsPerMonth: number;
  knowledgeBaseEnabled: boolean;
  realtimeEnabled: boolean;
  customRolesEnabled: boolean;
  activityRetentionDays: number;
  trialDays: number;
}

export interface PlanDto {
  id: string;
  tier: PlanTier;
  name: string;
  description: string | null;
  priceMonthlyUsdCents: number;
  priceAnnualUsdCents: number;
  features: PlanFeatures;
}

export interface SubscriptionUsageDto {
  aiOnboardingGenerationsUsed: number;
  aiChatMessagesUsed: number;
  aiTaskActionsUsed: number;
  aiTotalRequestsUsed: number;
  aiUsageResetAt: string;
}

export interface SubscriptionResponseDto {
  id: string;
  userId: string;
  plan: PlanDto;
  status: SubscriptionStatus;
  billingInterval: BillingInterval | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  usage: SubscriptionUsageDto;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutDto {
  tier: "PRO" | "BUSINESS";
  interval?: BillingInterval;
}

export interface CheckoutResponseDto {
  checkoutUrl: string;
  sessionId: string;
}

export interface BillingPortalResponseDto {
  portalUrl: string;
}

export interface CancelSubscriptionResponseDto {
  id: string;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export type PaymentStatus = "SUCCEEDED" | "FAILED" | "REFUNDED" | "PENDING";

export interface PaymentDto {
  id: string;
  userId: string;
  subscriptionId: string | null;
  stripePaymentIntentId: string | null;
  stripeInvoiceId: string | null;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  invoiceUrl: string | null;
  receiptUrl: string | null;
  createdAt: string;
}

export interface PaymentRequiredErrorPayload {
  statusCode: 402;
  error: string;
  code: string;
  message: string;
  limitType?: string;
  limit?: number | null;
  current?: number;
  requiredPlan?: PlanTier;
  upgradeUrl?: string;
}
