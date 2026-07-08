import {
  CheckCircle2,
  Clock,
  Folder,
  ListChecks,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {stat.value}
            </p>
          </div>
          <div className={`rounded-xl p-2.5 ${ICON_STYLES[stat.icon]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {stat.trend.direction !== "neutral" && (
          <p className={`mt-3 flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {stat.trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}