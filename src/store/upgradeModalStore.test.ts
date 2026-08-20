import { describe, it, expect, beforeEach } from "vitest";
import { useUpgradeModalStore } from "./upgradeModalStore";

describe("upgradeModalStore", () => {
  beforeEach(() => {
    useUpgradeModalStore.getState().closeUpgradePrompt();
    useUpgradeModalStore.getState().closePricingModal();
  });

  it("opens and closes upgrade prompt with payload", () => {
    expect(useUpgradeModalStore.getState().isUpgradePromptOpen).toBe(false);
    expect(useUpgradeModalStore.getState().upgradePromptPayload).toBeNull();

    const payload = {
      statusCode: 402 as const,
      error: "Payment Required",
      code: "PROJECT_LIMIT_REACHED",
      message: "You have reached the project limit.",
      limit: 3,
      current: 3,
      requiredPlan: "PRO" as const,
    };

    useUpgradeModalStore.getState().openUpgradePrompt(payload);

    expect(useUpgradeModalStore.getState().isUpgradePromptOpen).toBe(true);
    expect(useUpgradeModalStore.getState().upgradePromptPayload).toEqual(payload);

    useUpgradeModalStore.getState().closeUpgradePrompt();

    expect(useUpgradeModalStore.getState().isUpgradePromptOpen).toBe(false);
    expect(useUpgradeModalStore.getState().upgradePromptPayload).toBeNull();
  });

  it("opens and closes pricing modal with preselected tier", () => {
    expect(useUpgradeModalStore.getState().isPricingModalOpen).toBe(false);
    expect(useUpgradeModalStore.getState().preselectedTier).toBeNull();

    useUpgradeModalStore.getState().openPricingModal("BUSINESS");

    expect(useUpgradeModalStore.getState().isPricingModalOpen).toBe(true);
    expect(useUpgradeModalStore.getState().preselectedTier).toBe("BUSINESS");

    useUpgradeModalStore.getState().closePricingModal();

    expect(useUpgradeModalStore.getState().isPricingModalOpen).toBe(false);
    expect(useUpgradeModalStore.getState().preselectedTier).toBeNull();
  });
});
