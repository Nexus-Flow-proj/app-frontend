import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_NUMBER_COLUMNS = 3; // Number of task cards to show in skeleton state

function ColumnSkeleton() {
  return (
    <div className="w-68 shrink-0 rounded-2xl bg-card border border-border p-3.5 space-y-3">
      <Skeleton className="h-0.5 w-7" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-6 rounded-full" />
      </div>
      {[...Array(SKELETON_NUMBER_COLUMNS)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-secondary border border-border p-3 space-y-2"
        >
          <Skeleton className="h-3 w-14 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex justify-between items-center pt-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="size-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ColumnSkeleton;
