import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const StatsCardsSkeleton = memo(function StatsCardsSkeleton() {
  return (
    <div
      data-slot="card"
      className="group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10 col-span-1 md:col-span-2"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 pb-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-36" />
        <div className="ml-auto flex items-center gap-1">
          <Skeleton className="h-7 w-10" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
      <Skeleton className="h-[260px] w-full rounded-lg" />
    </div>
  );
});

export const DonutChartSkeleton = memo(function DonutChartSkeleton() {
  return (
    <div
      data-slot="card"
      className="group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10"
      aria-hidden="true"
    >
      <Skeleton className="h-4 w-32" />
      <div className="relative flex flex-col items-center py-4">
        <Skeleton className="size-[200px] rounded-full" />
        <div className="mt-2 flex justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-2.5 rounded-full" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-2.5 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-2.5 rounded-full" />
            <Skeleton className="h-3 w-7" />
          </div>
        </div>
      </div>
    </div>
  );
});

export const TopicRadarSkeleton = memo(function TopicRadarSkeleton() {
  return (
    <div
      data-slot="card"
      className="group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10"
      aria-hidden="true"
    >
      <Skeleton className="h-4 w-36" />
      <div className="flex flex-1 items-center justify-center py-4">
        <Skeleton className="size-[260px] rounded-full" />
      </div>
    </div>
  );
});

export const ReviewRadialSkeleton = memo(function ReviewRadialSkeleton() {
  return (
    <div
      data-slot="card"
      className="group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10"
      aria-hidden="true"
    >
      <Skeleton className="h-4 w-28" />
      <div className="relative flex flex-col items-center py-4">
        <Skeleton className="size-[200px] rounded-full" />
        <div className="mt-2 flex justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-2.5 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-2.5 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
});

export const HeatmapSkeleton = memo(function HeatmapSkeleton() {
  return (
    <div
      data-slot="card"
      className="group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-[3px] pt-5 pr-1">
          {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((_, i) => (
            <Skeleton key={i} className="h-[18px] w-[18px] rounded-sm" />
          ))}
        </div>
        <div className="flex-1 space-y-1">
          <Skeleton className="h-[18px] w-16" />
          <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-[3px]">
            {Array.from({ length: 371 }, (_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-sm" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-7" />
          <Skeleton className="size-3 rounded-sm" />
          <Skeleton className="size-3 rounded-sm" />
          <Skeleton className="size-3 rounded-sm" />
          <Skeleton className="size-3 rounded-sm" />
          <Skeleton className="size-3 rounded-sm" />
          <Skeleton className="h-3 w-7" />
        </div>
      </div>
    </div>
  );
});

export const RecentActivitySkeleton = memo(function RecentActivitySkeleton() {
  return (
    <div
      data-slot="card"
      className="group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-0 text-sm text-card-foreground ring-1 ring-foreground/10"
      aria-hidden="true"
    >
      <div className="space-y-1 px-4 pt-4 pb-0">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-44" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3"><Skeleton className="h-3 w-4" /></th>
              <th className="px-4 py-3"><Skeleton className="h-3 w-14" /></th>
              <th className="px-4 py-3"><Skeleton className="h-3 w-14" /></th>
              <th className="px-4 py-3"><Skeleton className="h-3 w-12" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i} className="border-b border-border">
                <td className="px-4 py-3"><Skeleton className="h-3 w-4" /></td>
                <td className="px-4 py-3"><Skeleton className="h-3 w-32" /></td>
                <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                <td className="px-4 py-3"><Skeleton className="h-3 w-16" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export const DashboardShellSkeleton = memo(function DashboardShellSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading dashboard...</span>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCardsSkeleton />
        <DonutChartSkeleton />
      </div>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        <TopicRadarSkeleton />
        <ReviewRadialSkeleton />
      </div>
      <HeatmapSkeleton />
      <RecentActivitySkeleton />
    </div>
  );
});
