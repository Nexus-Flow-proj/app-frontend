import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodaysFocus } from "../hooks/useTodaysFocus";
import { useToggleFocusItem } from "../hooks/useToggleFocusItem";

export function TodaysFocus() {
  const { data: items, isLoading, error } = useTodaysFocus();
  const toggleFocusItem = useToggleFocusItem();

  const completedCount = items?.filter((item) => item.completed).length ?? 0;
  const progress =
    items && items.length
      ? Math.round((completedCount / items.length) * 100)
      : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
        {items && (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{items.length} tasks completed
          </span>
        )}
      </CardHeader>

      <CardContent>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : isLoading || !items ? (
          <div className="space-y-3">
            <Skeleton className="h-1.5 w-full rounded-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
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
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-accent"
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
                    <p className="truncate text-xs text-muted-foreground">
                      {item.projectName}
                    </p>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}