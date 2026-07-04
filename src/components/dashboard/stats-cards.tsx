"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/constants";
import type { WeeklySolvedEntry } from "@/lib/dashboard-data";

interface StatsCardsProps {
  solvedToday: number;
  weeklySolved: WeeklySolvedEntry[];
}

const DAY_LABELS: Record<string, string> = {
  Sun: "Sun",
  Mon: "Mon",
  Tue: "Tue",
  Wed: "Wed",
  Thu: "Thu",
  Fri: "Fri",
  Sat: "Sat",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayName = DAY_LABELS[d.toLocaleDateString("en-US", { weekday: "short" })];
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  return `${dayName}, ${month} ${day}`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: WeeklySolvedEntry }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
      <p className="text-sm font-semibold">
        {entry.count} {entry.count === 1 ? "problem" : "problems"} solved
      </p>
    </div>
  );
}

export function StatsCards({ solvedToday, weeklySolved }: StatsCardsProps) {
  const chartData = weeklySolved.map((entry) => ({
    ...entry,
    label: new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
    }),
  }));

  return (
    <>
      <Card className="flex flex-col col-span-1 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <div className="flex size-8 items-center justify-center rounded-full bg-chart-2/15">
              <span className="text-sm font-bold text-chart-2">✓</span>
            </div>
            Solved This Week
            <span className="ml-auto text-2xl font-bold tracking-tight text-chart-2">
              {solvedToday}
            </span>
            <span className="text-xs text-foreground/60">today</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: CHART_COLORS.TICK_COLOR }}
                dy={4}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: CHART_COLORS.TICK_COLOR }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "var(--chart-2)",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
