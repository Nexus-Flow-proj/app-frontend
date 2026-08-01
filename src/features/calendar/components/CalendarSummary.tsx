import { CalendarDaysIcon, ClipboardListIcon } from "lucide-react";

interface CalendarSummaryProps {
  scheduledTaskCount: number;
  totalTaskCount: number;
}

export function CalendarSummary({
  scheduledTaskCount,
  totalTaskCount,
}: CalendarSummaryProps) {
  const unscheduledTaskCount = Math.max(totalTaskCount - scheduledTaskCount, 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border bg-card px-4 py-3 text-card-foreground">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDaysIcon className="size-4 text-primary" />
          Scheduled tasks
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {scheduledTaskCount}
        </p>
      </div>
      <div className="rounded-lg border bg-card px-4 py-3 text-card-foreground">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardListIcon className="size-4 text-primary" />
          Without due date
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {unscheduledTaskCount}
        </p>
      </div>
    </div>
  );
}
