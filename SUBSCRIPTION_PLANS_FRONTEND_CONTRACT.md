# Subscription Plans & Billing Module Frontend API Contract

This document serves as the official frontend API contract and integration guide for the **Subscription Plans, Quota Management & Stripe Billing** features on **Nexus Flow**.

---

## 📌 Overview & Business Model

Nexus Flow uses a **3-tier subscription model (Free / Pro / Business)** with a **project-context privilege architecture**:

| Plan | Monthly Price | Annual Price | Project Limits | Member Limits | Task Limits | Column Limits | Knowledge Base | Monthly AI Quota | Custom Roles |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **Free** | **$0** | **$0** | 3 owned | 5 / proj | 100 / proj | 3 / proj | ❌ Disabled | **3 total requests** / mo* | ❌ Disabled |
| **Pro** | **$12 / mo** | **$115.20 / yr** ($9.60/mo) | 5 owned | 5 / proj | 2,000 / proj | Unlimited | 40 chunks / proj | **6** Onboarding Plans<br>**40** Board Chats<br>**20** Task Actions | ✅ Enabled |
| **Business** | **$150 / mo** | **$1,440 / yr** ($120/mo) | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited | **Unlimited** | ✅ Enabled |

### 🎯 Two-Factor Privilege Model (Crucial for Frontend UI)

1. **Project Features (Tasks, Columns, Roles, Knowledge Base)**:
   - Evaluated based on the **project owner's/admin's plan tier**.
   - If a Free user is invited to a project owned by a **Pro** or **Business** admin, that project allows Pro/Business features (e.g., unlimited columns, custom roles, up to 2,000 or unlimited tasks).
2. **AI Quota**:
   - If a Free user works inside a project owned by a **Business** admin, they have **unlimited AI generations** within that project context!
   - In all other cases (personal drafts or non-Business projects), Free users share a single pool of **3 total AI requests per month**.
   - Pro users have dedicated monthly quotas (6 onboarding plans, 40 board chats, 20 task actions).

---

## 🔑 General Headers & Authentication

- **Base URL**: `/api`
- **Authentication**: Cookie-based JWT (`access_token`, `refresh_token`) or `Authorization: Bearer <token>`.
- **CSRF Token**: State-changing requests (`POST`, `PATCH`, `DELETE`) require the `x-csrf-token` header (retrieved from `GET /api/auth/csrf` or login response).
- **Content-Type**: `application/json`

---

## 📡 API Endpoints Specification

### 1. List Available Plans

Retrieves public plan tiers, pricing, and all feature limit definitions. Ideal for rendering pricing tables and comparison pages.

- **Endpoint**: `GET /api/subscriptions/plans`
- **Auth**: Public (no token required)

#### Response (`200 OK`)
```json
{
  "message": "Subscription plans retrieved successfully.",
  "data": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "tier": "FREE",
      "name": "Free",
      "description": "Essential project management tools for individuals and small teams.",
      "priceMonthlyUsdCents": 0,
      "priceAnnualUsdCents": 0,
      "features": {
        "maxProjectsOwned": 3,
        "maxMembersPerProject": 5,
        "maxTasksPerProject": 100,
        "maxBoardColumns": 3,
        "maxKnowledgeChunks": null,
        "aiOnboardingGenerations": null,
        "aiChatMessages": null,
        "aiTaskActions": null,
        "freeTierAiRequestsPerMonth": 3,
        "knowledgeBaseEnabled": false,
        "realtimeEnabled": false,
        "customRolesEnabled": false,
        "activityRetentionDays": 7,
        "trialDays": 0
      }
    },
    {
      "id": "22222222-2222-2222-2222-222222222222",
      "tier": "PRO",
      "name": "Pro",
      "description": "Advanced AI generation, higher limits, custom roles, and knowledge base for growing teams.",
      "priceMonthlyUsdCents": 1200,
      "priceAnnualUsdCents": 11520,
      "features": {
        "maxProjectsOwned": 5,
        "maxMembersPerProject": 5,
        "maxTasksPerProject": 2000,
        "maxBoardColumns": null,
        "maxKnowledgeChunks": 40,
        "aiOnboardingGenerations": 6,
        "aiChatMessages": 40,
        "aiTaskActions": 20,
        "freeTierAiRequestsPerMonth": 3,
        "knowledgeBaseEnabled": true,
        "realtimeEnabled": true,
        "customRolesEnabled": true,
        "activityRetentionDays": 90,
        "trialDays": 14
      }
    },
    {
      "id": "33333333-3333-3333-3333-333333333333",
      "tier": "BUSINESS",
      "name": "Business",
      "description": "Unlimited power, enterprise AI capabilities, and unlimited collaboration for large organizations.",
      "priceMonthlyUsdCents": 15000,
      "priceAnnualUsdCents": 144000,
      "features": {
        "maxProjectsOwned": null,
        "maxMembersPerProject": null,
        "maxTasksPerProject": null,
        "maxBoardColumns": null,
        "maxKnowledgeChunks": null,
        "aiOnboardingGenerations": null,
        "aiChatMessages": null,
        "aiTaskActions": null,
        "freeTierAiRequestsPerMonth": 3,
        "knowledgeBaseEnabled": true,
        "realtimeEnabled": true,
        "customRolesEnabled": true,
        "activityRetentionDays": 365,
        "trialDays": 0
      }
    }
  ]
}
```

---

### 2. Get My Subscription & Usage

Retrieves the currently authenticated user's active plan, subscription dates, trial status, and live AI quota counters.

- **Endpoint**: `GET /api/subscriptions/me`
- **Auth**: Required (JWT)

#### Response (`200 OK`)
```json
{
  "message": "User subscription retrieved successfully.",
  "data": {
    "id": "a9b8c7d6-e5f4-4a3b-8c2d-1e0f9a8b7c6d",
    "userId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "plan": {
      "id": "22222222-2222-2222-2222-222222222222",
      "tier": "PRO",
      "name": "Pro",
      "description": "Advanced AI generation, higher limits, custom roles, and knowledge base for growing teams.",
      "priceMonthlyUsdCents": 1200,
      "priceAnnualUsdCents": 11520,
      "features": {
        "maxProjectsOwned": 5,
        "maxMembersPerProject": 5,
        "maxTasksPerProject": 2000,
        "maxBoardColumns": null,
        "maxKnowledgeChunks": 40,
        "aiOnboardingGenerations": 6,
        "aiChatMessages": 40,
        "aiTaskActions": 20,
        "freeTierAiRequestsPerMonth": 3,
        "knowledgeBaseEnabled": true,
        "realtimeEnabled": true,
        "customRolesEnabled": true,
        "activityRetentionDays": 90,
        "trialDays": 14
      }
    },
    "status": "ACTIVE",
    "billingInterval": "MONTHLY",
    "currentPeriodStart": "2026-08-01T00:00:00.000Z",
    "currentPeriodEnd": "2026-09-01T00:00:00.000Z",
    "trialStart": "2026-08-01T00:00:00.000Z",
    "trialEnd": "2026-08-15T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "usage": {
      "aiOnboardingGenerationsUsed": 2,
      "aiChatMessagesUsed": 14,
      "aiTaskActionsUsed": 5,
      "aiTotalRequestsUsed": 21,
      "aiUsageResetAt": "2026-08-01T00:00:00.000Z"
    },
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-08-19T14:00:00.000Z"
  }
}
```

---

### 3. Create Stripe Checkout Session

Generates a hosted Stripe Checkout URL to initiate upgrade or purchase.

- **Endpoint**: `POST /api/subscriptions/checkout`
- **Auth**: Required (JWT + CSRF `x-csrf-token`)
- **Body**:
  - `tier` (`"PRO"` | `"BUSINESS"`, required): The target tier to subscribe to.
  - `interval` (`"MONTHLY"` | `"ANNUAL"`, optional, default: `"MONTHLY"`).

#### Request Example
```json
{
  "tier": "PRO",
  "interval": "MONTHLY"
}
```

#### Response (`200 OK`)
```json
{
  "message": "Checkout session created successfully.",
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3...",
    "sessionId": "cs_test_a1b2c3..."
  }
}
```

> **Frontend Implementation Tip**: Immediately redirect the user to `data.checkoutUrl`:
> ```ts
> window.location.href = data.checkoutUrl;
> ```

---

### 4. Create Stripe Customer Billing Portal Session

Generates a Stripe Billing Portal URL where users can update payment cards, view invoices, download receipts, or switch intervals.

- **Endpoint**: `POST /api/subscriptions/portal`
- **Auth**: Required (JWT + CSRF `x-csrf-token`)
- **Body**: None `{}`

#### Response (`200 OK`)
```json
{
  "message": "Billing portal session created successfully.",
  "data": {
    "portalUrl": "https://billing.stripe.com/p/session/test_a1b2c3..."
  }
}
```

> **Frontend Implementation Tip**:
> ```ts
> window.location.href = data.portalUrl;
> ```

---

### 5. Cancel Subscription (At Period End)

Schedules cancellation of a paid subscription at the end of the current billing cycle. The user retains Pro/Business access until `currentPeriodEnd`.

- **Endpoint**: `POST /api/subscriptions/cancel`
- **Auth**: Required (JWT + CSRF `x-csrf-token`)
- **Body**: None `{}`

#### Response (`200 OK`)
```json
{
  "message": "Subscription scheduled for cancellation at the end of the billing period.",
  "data": {
    "id": "a9b8c7d6-e5f4-4a3b-8c2d-1e0f9a8b7c6d",
    "status": "ACTIVE",
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "2026-09-01T00:00:00.000Z"
  }
}
```

---

### 6. Get Payment & Invoice History

Retrieves historical payment records, amounts, statuses, and links to Stripe invoices.

- **Endpoint**: `GET /api/subscriptions/payments`
- **Auth**: Required (JWT)

#### Response (`200 OK`)
```json
{
  "message": "Payment history retrieved successfully.",
  "data": [
    {
      "id": "e4f5a6b7-c8d9-4e0f-1a2b-3c4d5e6f7a8b",
      "userId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "subscriptionId": "a9b8c7d6-e5f4-4a3b-8c2d-1e0f9a8b7c6d",
      "stripePaymentIntentId": "pi_3MtwxULkdIwHu7ix0snN0Bv5",
      "stripeInvoiceId": "in_1MtwxULkdIwHu7ix0snN0Bv5",
      "amountCents": 1200,
      "currency": "usd",
      "status": "SUCCEEDED",
      "invoiceUrl": "https://invoice.stripe.com/i/acct_123/test_123",
      "receiptUrl": "https://pay.stripe.com/receipts/invoices/...",
      "createdAt": "2026-08-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🚨 HTTP 402 `PaymentRequiredException` Handling (Upgrade Modal Contract)

When a user or project hits any plan limit, the backend returns **`HTTP 402 Payment Required`** with a standardized error object:

### Standard 402 Payload Structure
```json
{
  "statusCode": 402,
  "error": "Payment Required",
  "code": "PROJECT_LIMIT_REACHED",
  "message": "You have reached the maximum limit of 3 projects on the Free plan. Upgrade to increase your project limit.",
  "limitType": "projects",
  "limit": 3,
  "current": 3,
  "requiredPlan": "PRO",
  "upgradeUrl": "/settings/billing"
}
```

### Complete List of Error Codes & Triggers

| Error Code | Triggering Endpoint | Description | Recommended UI Action |
|:---|:---|:---|:---|
| `PROJECT_LIMIT_REACHED` | `POST /api/projects` | User reached their owned project limit (3 on Free, 5 on Pro) | Show "Upgrade to Pro / Business" modal |
| `MEMBER_LIMIT_REACHED` | `POST /api/projects/:id/invites` | Project reached member limit (5 on Free / Pro) | Show "Upgrade to Business for unlimited members" modal |
| `TASK_LIMIT_REACHED` | `POST /api/projects/:id/tasks/:colId` | Project reached task limit (100 on Free, 2000 on Pro) | Show "Upgrade Plan" modal |
| `COLUMN_LIMIT_REACHED` | `POST /api/projects/:id/boards` | Project reached column limit (3 on Free) | Show "Upgrade to Pro for unlimited columns" modal |
| `CUSTOM_ROLES_NOT_ALLOWED` | `POST /api/projects/:id/roles` | Free project trying to create custom RBAC roles | Show "Custom roles are a Pro feature" modal |
| `KNOWLEDGE_BASE_NOT_ALLOWED`| `POST/GET /api/projects/:id/knowledge*` | Free project trying to use Knowledge Base / RAG | Show "Knowledge Base is a Pro feature" modal |
| `KNOWLEDGE_CHUNK_LIMIT_REACHED` | `POST /api/projects/:id/knowledge` | Pro project reached 40 knowledge document limit | Show "Upgrade to Business for unlimited docs" modal |
| `AI_FREE_QUOTA_EXCEEDED` | AI endpoints | Free user used all 3 monthly AI requests | Show "You used your 3 free monthly AI requests. Upgrade to Pro" modal |
| `AI_ONBOARDING_QUOTA_EXCEEDED` | `POST /api/projects/onboarding/ai/generate` | Pro user reached monthly quota (6) | Show "Upgrade to Business for unlimited AI" modal |
| `AI_CHAT_QUOTA_EXCEEDED` | `POST /api/projects/:id/ai/chat` | Pro user reached monthly quota (40) | Show "Upgrade to Business for unlimited AI" modal |
| `AI_TASK_QUOTA_EXCEEDED` | Task AI endpoints | Pro user reached monthly quota (20) | Show "Upgrade to Business for unlimited AI" modal |
| `PLAN_UPGRADE_REQUIRED` | Guarded endpoints | Feature requires a higher tier | Show Upgrade modal |

---

## 🛠️ TypeScript Interfaces (Copy-Paste Ready)

```typescript
export type PlanTier = 'FREE' | 'PRO' | 'BUSINESS';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'INCOMPLETE';

export type BillingInterval = 'MONTHLY' | 'ANNUAL';

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

export interface CheckoutResponseDto {
  checkoutUrl: string;
  sessionId: string;
}

export interface BillingPortalResponseDto {
  portalUrl: string;
}

export interface PaymentDto {
  id: string;
  userId: string;
  subscriptionId: string | null;
  stripePaymentIntentId: string | null;
  stripeInvoiceId: string | null;
  amountCents: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'PENDING';
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
```

---

## 🎨 Recommended Frontend Architecture & UI Flows

### 1. Axios / Fetch Interceptor Recipe for 402 Errors
```typescript
import axios from 'axios';
import { openUpgradeModal } from '@/store/modalStore';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 402) {
      const errorData = error.response.data;
      // Triggers a global Upgrade Prompt modal with contextual info
      openUpgradeModal({
        code: errorData.code,
        message: errorData.message,
        requiredPlan: errorData.requiredPlan || 'PRO',
      });
    }
    return Promise.reject(error);
  }
);
```

### 2. Suggested UI Components to Build
1. **`BillingSettingsTab.tsx`**:
   - Displays current plan badge (`FREE`, `PRO`, `BUSINESS`).
   - If on trial: shows countdown banner ("14 days left in your Pro trial").
   - Live AI Quota progress bar (`usage.aiTotalRequestsUsed / 3` for Free, or category bars for Pro).
   - "Manage Subscription / Billing Portal" button (calls `POST /api/subscriptions/portal`).
   - "Cancel Subscription" option (calls `POST /api/subscriptions/cancel`).
   - Invoice history table (calls `GET /api/subscriptions/payments`).
2. **`PricingComparisonModal.tsx`**:
   - Switch toggle between Monthly and Annual (showing "Save 20%").
   - 3 columns: Free ($0), Pro ($12), Business ($150).
   - "Upgrade" buttons triggering `POST /api/subscriptions/checkout` and redirecting to Stripe.
3. **`UpgradePromptModal.tsx`**:
   - Contextual modal that pops up when 402 is returned from creating tasks/columns/members/AI.
   - Shows what limit was hit and a direct CTA to upgrade.
