import { Skeleton } from "@/components/ui/skeleton";

export function WorkspacesPageSkeleton() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <Skeleton className="my-6 h-px w-full" />

      <Skeleton className="mb-6 h-9 w-72" />

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

        <div className="mt-8 flex items-center justify-center gap-2">
          <Skeleton className="h-9 w-9" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-9" />
          ))}
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}
