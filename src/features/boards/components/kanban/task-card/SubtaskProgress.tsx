import { cn } from "@/lib/utils";

interface subtaskProgressProps {
  completed: number;
  total: number;
}

function SubtaskProgress({ completed, total }: subtaskProgressProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const done = completed === total && total > 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            done ? "bg-emerald-500" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
        {completed}/{total}
      </span>
    </div>
  );
}

export default SubtaskProgress;
