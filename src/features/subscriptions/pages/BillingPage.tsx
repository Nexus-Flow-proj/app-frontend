import { useNavigate, useSearchParams } from "react-router";
import { CreditCard, RefreshCw } from "lucide-react";
import Loading from "@/components/shared/loading/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routing";
import { useMySubscription } from "../hooks/useMySubscription";
import {
  AiQuotaCard,
  BillingOverviewCard,
  PaymentHistoryTable,
  PaymentSuccessView,
  PaymentErrorView,
} from "../components";

export default function BillingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentResult = searchParams.get("success");
  const { data: subscription, isLoading, error, refetch, isRefetching } =
    useMySubscription();

  // ── Payment result screens (static, no backend calls) ──
  if (paymentResult === "true") {
    return (
      <PaymentSuccessView
        onDismiss={() => {
          searchParams.delete("success");
          setSearchParams(searchParams, { replace: true });
        }}
      />
    );
  }

  if (paymentResult === "false") {
    return <PaymentErrorView />;
  }

  if (isLoading) {

    return <Loading text="Loading billing details..." />;
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center rounded-xl border border-border p-12 text-center">
        <CreditCard className="mb-3 size-8 text-muted-foreground opacity-50" />
        <h2 className="text-sm font-semibold text-foreground">
          Failed to load billing information
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          There was an error retrieving your subscription data.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 text-xs"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`mr-1.5 size-3 ${isRefetching ? "animate-spin" : ""}`} />
          Retry
        </Button>
      </div>
    );
  }

  const planTier = subscription?.plan?.tier ?? "FREE";

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Subscription & Billing
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your subscription plan, monthly AI quotas, and invoices.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs font-medium"
          onClick={() => navigate(ROUTES.PRICING)}
        >
          Compare All Plans
        </Button>
      </div>

      {/* Overview & Quota Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          <BillingOverviewCard subscription={subscription} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <AiQuotaCard tier={planTier} usage={subscription?.usage} />
        </div>
      </div>

      {/* Payment & Invoice History Section */}
      <Card className="border-border/80 shadow-none">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-base font-semibold text-foreground">Invoices & Receipts</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Download verified Stripe invoices and payment receipts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <PaymentHistoryTable />
        </CardContent>
      </Card>
    </main>
  );
}
