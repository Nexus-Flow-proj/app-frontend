import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardCard({
  title,
  action,
  children,
  className,
  contentClassName,
}: DashboardCardProps) {
  return (
    <Card className={cn("rounded-lg [--card-spacing:--spacing(5)]", className)}>
      {(title || action) && (
        <CardHeader className="!flex min-h-11 !flex-row !items-center !justify-between gap-3">
          {title && (
            <CardTitle className="text-base font-semibold leading-none">
              {title}
            </CardTitle>
          )}
          {action && (
            <CardAction className="!self-center justify-self-auto">
              {action}
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
