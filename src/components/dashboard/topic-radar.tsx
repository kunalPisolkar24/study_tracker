"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/constants";
import type { TopicRadarEntry } from "@/lib/dashboard-data";

interface TopicRadarProps {
  data: TopicRadarEntry[];
}

interface TooltipPayload {
  payload: TopicRadarEntry;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const { topic, solved } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{topic}</p>
      <p className="text-muted-foreground">{solved} solved</p>
    </div>
  );
}

export function TopicRadar({ data }: TopicRadarProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Solved by Topic</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={CHART_COLORS.GRID_STROKE} />
            <PolarAngleAxis
              dataKey="topic"
              tick={{ fontSize: 11, fill: CHART_COLORS.TICK_FILL }}
            />
            <Radar
              name="Solved"
              dataKey="solved"
              stroke={CHART_COLORS.RADAR_FILL}
              fill={CHART_COLORS.RADAR_FILL}
              fillOpacity={0.25}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
