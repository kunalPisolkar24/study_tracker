"use client";

import { useEffect, useState, useMemo } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DifficultyDonut } from "@/components/dashboard/difficulty-donut";
import { TopicRadar } from "@/components/dashboard/topic-radar";
import { ReviewRadial } from "@/components/dashboard/review-radial";
import { Heatmap } from "@/components/dashboard/heatmap";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useTopicStore } from "@/stores/topic-store";
import { computeDashboardData } from "@/lib/dashboard-data";
import { getDashboardData } from "@/lib/services/dashboard-service";
import type { DashboardData } from "@/lib/dashboard-data";
import { DashboardShellSkeleton } from "@/components/dashboard/dashboard-skeleton";

export function DashboardShell() {
  const hydrated = useTopicStore((s) => s.hydrated);
  const topics = useTopicStore((s) => s.topics);
  const clientData = useMemo(() => computeDashboardData(topics), [topics]);
  const [serverData, setServerData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboardData().then(setServerData);
  }, []);

  const data = serverData ?? clientData;

  if (!hydrated) {
    return <DashboardShellSkeleton />;
  }

  return (
    <div className="mx-auto flex w-full flex-1 min-w-0 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCards solvedToday={data.solvedToday} weeklySolved={data.weeklySolved} />
        <DifficultyDonut breakdown={data.difficultyBreakdown} />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        <TopicRadar data={data.topicRadar} />
        <ReviewRadial
          solved={data.reviewStats.solved}
          markedForReview={data.reviewStats.markedForReview}
        />
      </div>

      <Heatmap data={data.heatmap} streak={data.streak} maxStreak={data.maxStreak} />

      <RecentActivity data={data.recentActivity} />
    </div>
  );
}
