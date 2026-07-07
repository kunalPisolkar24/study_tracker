"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DifficultyDonut } from "@/components/dashboard/difficulty-donut";
import { TopicRadar } from "@/components/dashboard/topic-radar";
import { ReviewRadial } from "@/components/dashboard/review-radial";
import { Heatmap } from "@/components/dashboard/heatmap";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useTopicStore } from "@/stores/topic-store";
import { computeDashboardData } from "@/lib/topics/dashboard-data";
import { getDashboardData } from "@/lib/topics/services/dashboard-service";
import type { DashboardData } from "@/lib/topics/dashboard-data";
import { DashboardShellSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { WidgetErrorBoundary } from "@/components/dashboard/widget-error-boundary";

export function DashboardShell() {
  const hydrated = useTopicStore((s) => s.hydrated);
  const topics = useTopicStore((s) => s.topics);
  const clientData = useMemo(() => computeDashboardData(topics), [topics]);
  const [serverData, setServerData] = useState<DashboardData | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    getDashboardData().then((data) => {
      if (mountedRef.current) setServerData(data);
    });
    return () => { mountedRef.current = false; };
  }, []);

  const data = clientData ?? serverData;

  if (!hydrated) {
    return <DashboardShellSkeleton />;
  }

  return (
    <div className="mx-auto flex w-full flex-1 min-w-0 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WidgetErrorBoundary title="Stats">
          <StatsCards solvedToday={data.solvedToday} weeklySolved={data.weeklySolved} />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary title="Difficulty">
          <DifficultyDonut breakdown={data.difficultyBreakdown} />
        </WidgetErrorBoundary>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        <WidgetErrorBoundary title="Topics">
          <TopicRadar data={data.topicRadar} />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary title="Review">
          <ReviewRadial
            solved={data.reviewStats.solved}
            markedForReview={data.reviewStats.markedForReview}
          />
        </WidgetErrorBoundary>
      </div>

      <WidgetErrorBoundary title="Heatmap">
        <Heatmap data={data.heatmap} streak={data.streak} maxStreak={data.maxStreak} />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary title="Activity">
        <RecentActivity data={data.recentActivity} />
      </WidgetErrorBoundary>
    </div>
  );
}
