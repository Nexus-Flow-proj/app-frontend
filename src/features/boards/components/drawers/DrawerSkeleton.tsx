import { Skeleton } from "@/components/ui/skeleton";

export function DrawerSkeleton() {
  return (
    <div className="space-y-4 mt-4 px-6 animate-pulse">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-px w-full my-3" />
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="flex-1 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
