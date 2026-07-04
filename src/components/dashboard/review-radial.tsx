"use client";

import { DonutChart } from "@/components/dashboard/donut-chart";
import { CHART_COLORS } from "@/lib/constants";

interface ReviewRadialProps {
  solved: number;
  markedForReview: number;
}

export function ReviewRadial({ solved, markedForReview }: ReviewRadialProps) {
  const pieData = [
    { name: "Solved", value: solved, color: CHART_COLORS.SOLVED },
    { name: "Review", value: markedForReview, color: CHART_COLORS.MARKED_FOR_REVIEW },
  ];

  return (
    <DonutChart
      title="Review Status"
      data={pieData}
      centerLabel="Total"
      centerSubtext={`${solved + markedForReview}`}
    />
  );
}
