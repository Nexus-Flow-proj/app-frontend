import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api/axios";
import { subscriptionService } from "./index";

vi.mock("@/lib/api/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("subscriptionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls getPlans successfully", async () => {
    const mockPlans = [
      { id: "1", tier: "FREE", name: "Free", priceMonthlyUsdCents: 0 },
      { id: "2", tier: "PRO", name: "Pro", priceMonthlyUsdCents: 1200 },
    ];
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { success: true, message: "OK", statusCode: 200, data: mockPlans },
    } as any);

    const res = await subscriptionService.getPlans();
    expect(api.get).toHaveBeenCalledWith("/subscriptions/plans");
    expect(res.data).toEqual(mockPlans);
  });

  it("calls getMySubscription successfully", async () => {
    const mockSub = {
      id: "sub-1",
      userId: "u-1",
      plan: { tier: "PRO", name: "Pro" },
      status: "ACTIVE",
    };
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { success: true, message: "OK", statusCode: 200, data: mockSub },
    } as any);

    const res = await subscriptionService.getMySubscription();
    expect(api.get).toHaveBeenCalledWith("/subscriptions/me");
    expect(res.data).toEqual(mockSub);
  });

  it("calls createCheckout with correct payload", async () => {
    const mockCheckout = {
      checkoutUrl: "https://checkout.stripe.com/pay/123",
      sessionId: "cs_123",
    };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { success: true, message: "OK", statusCode: 200, data: mockCheckout },
    } as any);

    const res = await subscriptionService.createCheckout({
      tier: "PRO",
      interval: "MONTHLY",
    });
    expect(api.post).toHaveBeenCalledWith("/subscriptions/checkout", {
      tier: "PRO",
      interval: "MONTHLY",
    });
    expect(res.data).toEqual(mockCheckout);
  });

  it("calls createCustomerPortal successfully", async () => {
    const mockPortal = {
      portalUrl: "https://billing.stripe.com/session/123",
    };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { success: true, message: "OK", statusCode: 200, data: mockPortal },
    } as any);

    const res = await subscriptionService.createCustomerPortal();
    expect(api.post).toHaveBeenCalledWith("/subscriptions/portal", {});
    expect(res.data).toEqual(mockPortal);
  });

  it("calls cancelSubscription successfully", async () => {
    const mockCancel = {
      id: "sub-1",
      status: "ACTIVE",
      cancelAtPeriodEnd: true,
      currentPeriodEnd: "2026-09-01T00:00:00.000Z",
    };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { success: true, message: "OK", statusCode: 200, data: mockCancel },
    } as any);

    const res = await subscriptionService.cancelSubscription();
    expect(api.post).toHaveBeenCalledWith("/subscriptions/cancel", {});
    expect(res.data).toEqual(mockCancel);
  });

  it("calls getPaymentHistory successfully", async () => {
    const mockPayments = [
      { id: "p-1", amountCents: 1200, status: "SUCCEEDED" },
    ];
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { success: true, message: "OK", statusCode: 200, data: mockPayments },
    } as any);

    const res = await subscriptionService.getPaymentHistory();
    expect(api.get).toHaveBeenCalledWith("/subscriptions/payments");
    expect(res.data).toEqual(mockPayments);
  });
});
