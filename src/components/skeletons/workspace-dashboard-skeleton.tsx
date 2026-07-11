import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceDashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-1 h-4 w-36" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col rounded-xl border p-6">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-col items-center justify-center pt-4">
            <Skeleton className="size-[200px] rounded-full" />
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="size-3 rounded-sm" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-xl border p-6">
          <Skeleton className="h-5 w-36" />
          <div className="flex flex-col items-center justify-center pt-4">
            <Skeleton className="size-[200px] rounded-full" />
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="size-3 rounded-sm" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-xl border p-6">
        <Skeleton className="h-5 w-40" />
        <div className="pt-4">
          <Skeleton className="h-[260px] w-full rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-1 h-3 w-40" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="pt-4 flex gap-[3px]">
          {Array.from({ length: 26 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="size-[14px] rounded-sm" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
