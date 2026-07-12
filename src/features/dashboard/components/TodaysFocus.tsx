import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodaysFocus } from "../hooks/useTodaysFocus";
import { useToggleFocusItem } from "../hooks/useToggleFocusItem";
import { DashboardCard } from "./DashboardCard";

interface TodaysFocusProps {
  isDashboardLoading?: boolean;
}

export function TodaysFocus({ isDashboardLoading = false }: TodaysFocusProps) {
  const { data: items, isLoading, error } = useTodaysFocus();
  const toggleFocusItem = useToggleFocusItem();
  const showSkeleton = !error && (isDashboardLoading || isLoading || !items);

  const completedCount = items?.filter((item) => item.completed).length ?? 0;
  const progress =
    items && items.length
      ? Math.round((completedCount / items.length) * 100)
      : 0;

  if (showSkeleton) {
    return <Skeleton className="h-72 rounded-lg" />;
  }

  return (
    <DashboardCard
      title="Today's focus"
      action={
        items ? (
          <span className="text-sm text-muted-foreground">
            {completedCount}/{items.length} tasks completed
          </span>
        ) : null
      }
    >
      {error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : !items || items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No focus items for today.
        </p>
      ) : (
        <>
          <Progress value={progress} className="h-1.5" />

          <ul className="mt-4 space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-accent"
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) =>
                    toggleFocusItem.mutate({
                      taskId: item.taskId,
                      completed: checked === true,
                    })
                  }
                />
                <span className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm ${
                      item.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {item.projectName}
                  </p>
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </DashboardCard>
  );
}
