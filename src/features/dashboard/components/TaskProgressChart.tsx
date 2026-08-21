import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardUiStore } from "../../../store/dashboardUiStore";
import { useTaskProgress } from "../hooks/useTaskProgress";
import type { TaskProgressRange } from "../types";
import { DashboardCard } from "./DashboardCard";

const RANGE_OPTIONS: { value: TaskProgressRange; label: string }[] = [
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
];

interface TaskProgressChartProps {
  isDashboardLoading?: boolean;
}

export function TaskProgressChart({
  isDashboardLoading = false,
}: TaskProgressChartProps) {
  const setTaskProgressRange = useDashboardUiStore(
    (s) => s.setTaskProgressRange,
  );
  const { range, data, isLoading, error } = useTaskProgress();
  const showSkeleton = !error && (isDashboardLoading || isLoading || !data);

  if (showSkeleton) {
    return <Skeleton className="h-80 rounded-lg lg:col-span-2" />;
  }

  return (
    <DashboardCard
      title="Task progress"
      className="lg:col-span-2"
      action={
        <Select
          value={range}
          onValueChange={(value) =>
            setTaskProgressRange(value as TaskProgressRange)
          }
        >
          <SelectTrigger className="h-8 w-[150px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      {error ? (
        <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          {error}
        </p>
      ) : !data || data.points.every((p) => p.completed === 0) ? (
        <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          No completed tasks in this period yet.
        </p>
      ) : (
        <>
          <TaskProgressBars points={data.points} />
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Tasks Completed
          </div>
        </>
      )}
    </DashboardCard>
  );
}

function TaskProgressBars({
  points,
}: {
  points: { day: string; completed: number }[];
}) {
  const chartWidth = 640;
  const chartHeight = 224;
  const margin = { top: 10, right: 8, bottom: 30, left: 38 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;
  const maxCompleted = Math.max(...points.map((p) => p.completed), 1);
  const tickCount = Math.min(maxCompleted, 4) + 1;
  const ticks = Array.from({ length: tickCount }, (_, index) =>
    Math.round((maxCompleted / (tickCount - 1)) * index),
  );
  const bandWidth = plotWidth / points.length;
  const barWidth = Math.min(44, bandWidth * 0.58);

  const getY = (value: number) =>
    margin.top + plotHeight - (value / maxCompleted) * plotHeight;

  return (
    <div className="h-56 w-full">
      <svg
        className="h-full w-full overflow-visible"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Task progress bar chart"
      >
        {ticks.map((tick) => {
          const y = getY(tick);

          return (
            <g key={tick}>
              {tick === 0 && (
                <line
                  x1={margin.left}
                  x2={chartWidth - margin.right}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeDasharray="3 3"
                />
              )}
              <text
                x={margin.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[12px]"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {points.map((point, index) => {
          const barHeight = (point.completed / maxCompleted) * plotHeight;
          const x = margin.left + index * bandWidth + (bandWidth - barWidth) / 2;
          const y = margin.top + plotHeight - barHeight;

          return (
            <g key={point.day}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                className="fill-primary/85"
              >
                <title>{`${point.completed} completed tasks`}</title>
              </rect>
              <text
                x={margin.left + index * bandWidth + bandWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[12px]"
              >
                {point.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
