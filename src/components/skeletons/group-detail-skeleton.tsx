import { Skeleton } from "@/components/ui/skeleton";

export function GroupDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start gap-4 sm:items-center">
        <Skeleton className="size-9 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Skeleton className="h-9 flex-1 sm:flex-none sm:w-36" />
          <Skeleton className="h-9 flex-1 sm:flex-none sm:w-24" />
        </div>
      </div>

      <Skeleton className="my-6 h-px w-full" />

      <div className="flex-1">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-xl border p-6">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex-1 pt-4">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="pt-4">
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
