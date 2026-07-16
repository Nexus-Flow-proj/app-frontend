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
  const max = Math.max(...points.map((p) => p.completed), 1);

  return (
    <div className="flex h-56 items-end gap-4">
      {points.map((point) => (
        <div
          key={point.day}
          className="flex flex-1 flex-col items-center gap-2"
        >
          <div className="flex h-48 w-full items-end">
            <div
              className="w-full rounded-t-md bg-primary/85 transition-all"
              style={{ height: `${(point.completed / max) * 100}%` }}
              title={`${point.completed} tasks`}
            />
          </div>
          <span className="text-sm text-muted-foreground">{point.day}</span>
        </div>
      ))}
    </div>
  );
}
