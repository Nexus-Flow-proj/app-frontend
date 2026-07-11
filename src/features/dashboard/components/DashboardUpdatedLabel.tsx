import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatRelativeTime } from "../utils/format";

interface DashboardUpdatedLabelProps {
  updatedAt: number;
}

/**
 * Self-contained "Updated Xm ago" pill. Ticks every 30s on its own state,
 * so the re-render caused by the tick is scoped to just this component -
 * it never touches DashboardPage or any of the cards below it.
 */
export function DashboardUpdatedLabel({
  updatedAt,
}: DashboardUpdatedLabelProps) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!updatedAt) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      Updated {formatRelativeTime(new Date(updatedAt).toISOString())}
    </div>
  );
}