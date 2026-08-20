import { Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PlanTier } from "../types";

interface PlanBadgeProps {
  tier?: PlanTier;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function PlanBadge({
  tier = "FREE",
  className = "",
  size = "default",
}: PlanBadgeProps) {
  const getBadgeStyle = () => {
    switch (tier) {
      case "PRO":
        return "border-primary/30 bg-primary/10 text-primary font-medium dark:bg-primary/15";
      case "BUSINESS":
        return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium";
      case "FREE":
      default:
        return "border-border bg-muted/60 text-muted-foreground font-normal";
    }
  };

  const getLabel = () => {
    switch (tier) {
      case "PRO":
        return "Pro";
      case "BUSINESS":
        return "Business";
      case "FREE":
      default:
        return "Free";
    }
  };

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    default: "text-xs px-2.5 py-0.5 gap-1.5",
    lg: "text-xs px-3 py-1 gap-1.5 font-medium",
  }[size];

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center rounded-md font-sans transition-colors ${getBadgeStyle()} ${sizeClasses} ${className}`}
    >
      {tier === "PRO" && <Sparkles className="size-3 shrink-0" />}
      {tier === "BUSINESS" && <Crown className="size-3 shrink-0" />}
      <span>{getLabel()}</span>
    </Badge>
  );
}
