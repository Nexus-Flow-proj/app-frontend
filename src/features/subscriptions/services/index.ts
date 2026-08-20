import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  BillingPortalResponseDto,
  CancelSubscriptionResponseDto,
  CheckoutDto,
  CheckoutResponseDto,
  PaymentDto,
  PlanDto,
  SubscriptionResponseDto,
} from "../types";

export const subscriptionService = {
  getPlans: async () => {
    const response = await api.get<ApiResponse<PlanDto[]>>(
      "/subscriptions/plans",
    );
    return response.data;
  },

  getMySubscription: async () => {
    const response = await api.get<ApiResponse<SubscriptionResponseDto>>(
      "/subscriptions/me",
    );
    return response.data;
  },

  createCheckout: async (dto: CheckoutDto) => {
    const response = await api.post<ApiResponse<CheckoutResponseDto>>(
      "/subscriptions/checkout",
      dto,
    );
    return response.data;
  },

  createCustomerPortal: async () => {
    const response = await api.post<ApiResponse<BillingPortalResponseDto>>(
      "/subscriptions/portal",
      {},
    );
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.post<ApiResponse<CancelSubscriptionResponseDto>>(
      "/subscriptions/cancel",
      {},
    );
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await api.get<ApiResponse<PaymentDto[]>>(
      "/subscriptions/payments",
    );
    return response.data;
  },
};
