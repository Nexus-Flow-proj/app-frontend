import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, LayoutDashboard, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routing";

const REDIRECT_SECONDS = 15;

const PERKS = [
  "Unlimited AI generations",
  "Custom roles & permissions",
  "Priority support",
  "Advanced analytics",
  "Unlimited board columns",
];

interface PaymentSuccessViewProps {
  onDismiss: () => void;
}

export function PaymentSuccessView({ onDismiss }: PaymentSuccessViewProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (countdown <= 0) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-12">
      {/* ── Confetti Particles ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="payment-confetti-dot absolute rounded-full"
            style={{
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              left: `${Math.random() * 100}%`,
              top: `${-10 + Math.random() * 20}%`,
              background: [
                "hsl(142, 71%, 45%)",
                "hsl(217, 91%, 60%)",
                "hsl(280, 67%, 60%)",
                "hsl(38, 92%, 50%)",
                "hsl(349, 89%, 60%)",
                "hsl(168, 76%, 42%)",
              ][i % 6],
              animationDelay: `${Math.random() * 2.5}s`,
              animationDuration: `${2.5 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <Card className="relative z-10 w-full max-w-md border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardContent className="flex flex-col items-center p-8 text-center">
          {/* ── Animated Checkmark ── */}
          <div className="payment-success-icon relative mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" style={{ animationDuration: "2s" }} />
            <svg
              className="payment-success-checkmark relative z-10 size-10 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" className="payment-checkmark-path" />
            </svg>
          </div>

          {/* ── Heading ── */}
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Payment Successful!
          </h1>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Your subscription has been upgraded successfully. You now have access
            to all premium features.
          </p>

          {/* ── Perks List ── */}
          <Separator className="my-5" />
          <div className="w-full space-y-2.5">
            <p className="text-xs font-medium text-foreground">
              What's included:
            </p>
            <ul className="space-y-1.5">
              {PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <svg
                      className="size-2.5 text-emerald-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          {/* ── CTA Buttons ── */}
          <Separator className="my-5" />
          <div className="flex w-full flex-col gap-2.5 sm:flex-row">
            <Button
              className="flex-1 gap-1.5 text-xs"
              onClick={() => navigate(ROUTES.DASHBOARD, { replace: true })}
            >
              <LayoutDashboard className="size-3.5" />
              Go to Dashboard
              <ArrowRight className="ml-auto size-3.5" />
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5 text-xs"
              onClick={onDismiss}
            >
              <Receipt className="size-3.5" />
              View Billing Details
            </Button>
          </div>

          {/* ── Countdown ── */}
          <p className="mt-4 text-[10px] text-muted-foreground/60">
            Redirecting to dashboard in{" "}
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[10px] font-mono tabular-nums"
            >
              {countdown}s
            </Badge>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
