"use client";

import { DonutChart } from "@/components/dashboard/donut-chart";
import { CHART_COLORS } from "@/lib/constants";
import type { DifficultyStats } from "@/lib/dashboard-data";

interface DifficultyDonutProps {
  breakdown: Record<"EASY" | "MEDIUM" | "HARD", DifficultyStats>;
}

export function DifficultyDonut({ breakdown }: DifficultyDonutProps) {
  const totalSolved = Object.values(breakdown).reduce((acc, d) => acc + d.solved, 0);
  const totalProblems = Object.values(breakdown).reduce((acc, d) => acc + d.total, 0);

  const pieData = (Object.entries(breakdown) as [string, DifficultyStats][]).map(
    ([key, val]) => ({
      name: key,
      value: val.total,
      color: CHART_COLORS[key as keyof typeof CHART_COLORS],
      label: key === "EASY" ? "Easy" : key === "MEDIUM" ? "Medium" : "Hard",
      hoverDetail: `${val.solved} / ${val.total}`,
    })
  );

  return (
    <DonutChart
      title="Problem Breakdown"
      data={pieData}
      centerLabel="Solved"
      centerSubtext={`${totalSolved} / ${totalProblems}`}
    />
  );
}
