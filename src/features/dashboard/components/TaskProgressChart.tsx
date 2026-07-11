
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardUiStore } from "../store/dashboardUiStore";
import { useTaskProgress } from "../hooks/useTaskProgress";
import type { TaskProgressRange } from "../types";

const RANGE_OPTIONS: { value: TaskProgressRange; label: string }[] = [
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
];

export function TaskProgressChart() {
  const setTaskProgressRange = useDashboardUiStore(
    (s) => s.setTaskProgressRange,
  );
  const { range, data, isLoading, error } = useTaskProgress();

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
        <Select
          value={range}
          onValueChange={(value) =>
            setTaskProgressRange(value as TaskProgressRange)
          }
        >
          <SelectTrigger className="h-8 w-[150px] text-xs">
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
      </CardHeader>

      <CardContent>
        {error ? (
          <p className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            {error}
          </p>
        ) : isLoading || !data ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : data.points.every((p) => p.completed === 0) ? (
          <p className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No completed tasks in this period yet.
          </p>
        ) : (
          <>
            <TaskProgressBars points={data.points} />
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Tasks Completed
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TaskProgressBars({
  points,
}: {
  points: { day: string; completed: number }[];
}) {
  const max = Math.max(...points.map((p) => p.completed), 1);

  return (
    <div className="flex h-48 items-end gap-4">
      {points.map((point) => (
        <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-40 w-full items-end">
            <div
              className="w-full rounded-t-md bg-primary/80 transition-all"
              style={{ height: `${(point.completed / max) * 100}%` }}
              title={`${point.completed} tasks`}
            />
          </div>
          <span className="text-xs text-muted-foreground">{point.day}</span>
        </div>
      ))}
    </div>
  );
}