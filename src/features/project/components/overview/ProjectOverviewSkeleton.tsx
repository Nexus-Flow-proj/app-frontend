import { Skeleton } from "@/components/ui/skeleton";

export function ProjectOverviewSkeleton() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-1 py-1">
      <section className="rounded-lg border bg-muted/30 p-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-4 h-9 w-72 max-w-full" />
        <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-24" />
          ))}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </section>
    </main>
  );
}
