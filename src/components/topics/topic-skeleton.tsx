import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const TopicCardSkeleton = memo(function TopicCardSkeleton() {
  return (
    <div
      data-slot="card"
      className="group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-3/5" />
        <div className="flex shrink-0 gap-0.5">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="flex items-center rounded-b-xl border-t bg-muted/50 px-4 pb-4 pt-3 -mx-4 -mb-4">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
});

export const ProblemRowSkeleton = memo(function ProblemRowSkeleton() {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
      aria-hidden="true"
    >
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-7 w-12 rounded-md" />
    </div>
  );
});

export const SubtopicSectionSkeleton = memo(function SubtopicSectionSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <Skeleton className="mt-0.5 size-4 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-1">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      </div>
      <div className="space-y-1 pl-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="overflow-x-auto pl-6">
        <div className="flex w-max min-w-full flex-col gap-2">
          <ProblemRowSkeleton />
          <ProblemRowSkeleton />
          <ProblemRowSkeleton />
        </div>
      </div>
    </div>
  );
});

export const TopicDetailSkeleton = memo(function TopicDetailSkeleton() {
  return (
    <div
      className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading topic details...</span>
      <div className="mb-2 space-y-2">
        <Skeleton className="h-7 w-2/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="mb-6 space-y-1.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <div className="mb-6">
        <Skeleton className="h-px w-full" />
      </div>
      <div className="flex-1 space-y-8">
        <SubtopicSectionSkeleton />
        <SubtopicSectionSkeleton />
      </div>
    </div>
  );
});
