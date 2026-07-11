import { Skeleton } from "@/components/ui/skeleton";

const TREE_ROWS = [
  { depth: 0, titleWidth: "w-48" },
  { depth: 1, titleWidth: "w-36" },
  { depth: 1, titleWidth: "w-44" },
  { depth: 2, titleWidth: "w-28" },
  { depth: 0, titleWidth: "w-40" },
];

export function WorkspaceDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-1.5 w-16" />
          </div>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>

      <Skeleton className="my-6 h-px w-full" />

      <Skeleton className="h-9 w-24" />

      <div className="mt-6 flex-1 space-y-1">
        {TREE_ROWS.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg px-2 py-2.5"
            style={{ paddingLeft: `${12 + row.depth * 16}px` }}
          >
            <Skeleton className="size-5 shrink-0 rounded-md" />
            <Skeleton className={`h-5 ${row.titleWidth}`} />
            <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
            <Skeleton className="h-5 w-12 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
