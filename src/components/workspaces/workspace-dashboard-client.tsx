"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeftIcon, SquareActivity } from "@hugeicons/core-free-icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { Heatmap } from "@/components/dashboard/heatmap";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodeStore } from "@/stores/node-store";
import { WorkspaceDashboardSkeleton } from "@/components/skeletons/workspace-dashboard-skeleton";
import { computeWorkspaceDashboardData } from "@/lib/workspace/workspace-dashboard-data";
import { CHART_COLORS } from "@/lib/shared/constants";

interface WorkspaceDashboardClientProps {
  workspaceId: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { date: string; count: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">
        {new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <p className="text-sm font-semibold">
        {entry.count} {entry.count === 1 ? "topic" : "topics"} done
      </p>
    </div>
  );
}

export function WorkspaceDashboardClient({ workspaceId }: WorkspaceDashboardClientProps) {
  const wsHydrated = useWorkspaceStore((s) => s.hydrated);
  const nodeHydrated = useNodeStore((s) => s.hydrated);
  const workspace = useWorkspaceStore((s) => s.workspaces.find((w) => w.id === workspaceId));
  const allNodes = useNodeStore((s) => s.nodes);
  const allLogs = useNodeStore((s) => s.activityLogs);

  const nodes = useMemo(
    () => allNodes.filter((n) => n.workspaceId === workspaceId),
    [allNodes, workspaceId],
  );
  const logs = useMemo(
    () => allLogs.filter((l) => l.workspaceId === workspaceId),
    [allLogs, workspaceId],
  );

  const data = useMemo(
    () => computeWorkspaceDashboardData(nodes, logs),
    [nodes, logs],
  );

  if (!wsHydrated || !nodeHydrated) return <WorkspaceDashboardSkeleton />;

  if (!workspace) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-lg font-medium">Workspace not found</p>
        <p className="text-sm text-muted-foreground">This workspace does not exist.</p>
        <Button variant="outline" asChild>
          <Link href="/workspaces">
            <HugeiconsIcon icon={ArrowLeftIcon} />
            Back to Workspaces
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{workspace.name}</h1>
          <p className="text-sm text-muted-foreground">Workspace Dashboard</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/workspaces/${workspaceId}`}>
            <HugeiconsIcon icon={ArrowLeftIcon} />
            Back to Topics
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DonutChart
          title="Status Breakdown"
          data={data.statusBreakdown}
          centerLabel="Total"
          centerSubtext={`${data.totalNodes}`}
        />
        <DonutChart
          title="Confidence Breakdown"
          data={data.confidenceBreakdown}
          centerLabel="Reviewed"
          centerSubtext={`${data.confidenceBreakdown.reduce((a, b) => a + b.value, 0)}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={SquareActivity} className="size-5 text-chart-2" />
            Topics Marked Done
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.doneOverTime} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="doneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: CHART_COLORS.TICK_COLOR }}
                dy={4}
                tickFormatter={(val: string) =>
                  new Date(val + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
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
                fill="url(#doneGradient)"
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

      <Heatmap
        data={data.heatmap}
        streak={data.streak}
        maxStreak={data.maxStreak}
        title="Activity"
        description="Node activity per day"
      />
    </div>
  );
}
