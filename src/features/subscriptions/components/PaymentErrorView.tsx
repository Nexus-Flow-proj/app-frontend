import { useNavigate } from "react-router";
import { ArrowRight, LayoutDashboard, RefreshCw, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routing";

export function PaymentErrorView() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="relative z-10 w-full max-w-md border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardContent className="flex flex-col items-center p-8 text-center">
          {/* ── Animated Error Icon ── */}
          <div className="payment-error-icon relative mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="payment-error-x relative z-10 size-10 text-destructive"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" className="payment-error-circle" />
              <path d="M15 9l-6 6" className="payment-error-line-1" />
              <path d="M9 9l6 6" className="payment-error-line-2" />
            </svg>
          </div>

          {/* ── Heading ── */}
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Payment Unsuccessful
          </h1>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Your payment could not be processed, or the checkout was cancelled.
            No charges were made to your account.
          </p>

          {/* ── What to do next ── */}
          <Separator className="my-5" />
          <div className="w-full space-y-2.5">
            <p className="text-xs font-medium text-foreground">
              What you can do:
            </p>
            <ul className="space-y-1.5 text-left">
              <li className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  1
                </span>
                Double-check your payment method and try again
              </li>
              <li className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  2
                </span>
                Try a different card or payment method
              </li>
              <li className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  3
                </span>
                Contact support if the issue persists
              </li>
            </ul>
          </div>

          {/* ── CTA Buttons ── */}
          <Separator className="my-5" />
          <div className="flex w-full flex-col gap-2.5 sm:flex-row">
            <Button
              className="flex-1 gap-1.5 text-xs"
              onClick={() => navigate(ROUTES.PRICING)}
            >
              <RefreshCw className="size-3.5" />
              Try Again
              <ArrowRight className="ml-auto size-3.5" />
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5 text-xs"
              onClick={() => navigate(ROUTES.DASHBOARD, { replace: true })}
            >
              <LayoutDashboard className="size-3.5" />
              Go to Dashboard
            </Button>
          </div>

          {/* ── Support Link ── */}
          <p className="mt-4 text-[10px] text-muted-foreground/60">
            Need help?{" "}
            <button
              type="button"
              className="inline-flex items-center gap-0.5 text-primary/70 underline-offset-2 hover:text-primary hover:underline"
              onClick={() =>
                window.open("mailto:support@nexus-flow.com", "_blank")
              }
            >
              <MailOpen className="inline size-2.5" />
              Contact support
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
