import { create } from "zustand";
import type {
  PaymentRequiredErrorPayload,
  PlanTier,
} from "@/features/subscriptions/types";

interface UpgradeModalState {
  isUpgradePromptOpen: boolean;
  upgradePromptPayload: PaymentRequiredErrorPayload | null;
  isPricingModalOpen: boolean;
  preselectedTier: PlanTier | null;
  openUpgradePrompt: (payload: PaymentRequiredErrorPayload) => void;
  closeUpgradePrompt: () => void;
  openPricingModal: (preselectedTier?: PlanTier) => void;
  closePricingModal: () => void;
}

export const useUpgradeModalStore = create<UpgradeModalState>((set) => ({
  isUpgradePromptOpen: false,
  upgradePromptPayload: null,
  isPricingModalOpen: false,
  preselectedTier: null,

  openUpgradePrompt: (payload) =>
    set({
      isUpgradePromptOpen: true,
      upgradePromptPayload: payload,
    }),

  closeUpgradePrompt: () =>
    set({
      isUpgradePromptOpen: false,
      upgradePromptPayload: null,
    }),

  openPricingModal: (preselectedTier) =>
    set({
      isPricingModalOpen: true,
      preselectedTier: preselectedTier ?? null,
    }),

  closePricingModal: () =>
    set({
      isPricingModalOpen: false,
      preselectedTier: null,
    }),
}));
