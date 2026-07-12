import {
  CheckCircle2,
  Clock,
  Folder,
  ListChecks,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import type { DashboardStat, DashboardStatIcon } from "../types";

const ICONS: Record<DashboardStatIcon, LucideIcon> = {
  folder: Folder,
  "list-checks": ListChecks,
  "check-circle": CheckCircle2,
  clock: Clock,
};

// Fixed accent colors on purpose - these are status indicators, not part of
// the neutral text/background theme, so they stay the same in dark & light.
const ICON_STYLES: Record<DashboardStatIcon, string> = {
  folder: "bg-indigo-500/15 text-indigo-500 dark:text-indigo-400",
  "list-checks": "bg-primary/15 text-primary",
  "check-circle": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  clock: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

interface StatsGridProps {
  stats: DashboardStat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
}

function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = ICONS[stat.icon];
  const TrendIcon = stat.trend.direction === "down" ? TrendingDown : TrendingUp;
  const trendColor =
    stat.trend.direction === "down"
      ? "text-rose-600 dark:text-rose-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <DashboardCard className="h-full justify-start" contentClassName="h-full">
      <div className="flex h-full items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {stat.label}
          </p>
          <p className="mt-1 text-5xl py-2 font-semibold leading-none tracking-tight text-foreground">
            {stat.value}
          </p>
          {stat.trend.direction !== "neutral" && (
            <p
              className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${trendColor}`}
            >
              <TrendIcon className="size-3.5" />
              {stat.trend.label}
            </p>
          )}
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${ICON_STYLES[stat.icon]}`}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </DashboardCard>
  );
}
