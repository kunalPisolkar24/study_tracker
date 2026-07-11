import type { NodeStoreItem, NodeActivityEntry } from "@/types/node";
import { toDateStr } from "@/lib/shared/date-utils";
import { computeStreaks, computeHeatmap } from "@/lib/shared/streak-utils";
import type { HeatmapEntry } from "@/lib/shared/streak-utils";
import { isLeaf } from "@/lib/workspace/node-utils";

export interface WorkspaceDashboardData {
  heatmap: HeatmapEntry[];
  streak: number;
  maxStreak: number;
  doneOverTime: { date: string; count: number }[];
  statusBreakdown: { name: string; value: number; color: string; label: string }[];
  confidenceBreakdown: { name: string; value: number; color: string; label: string }[];
  totalNodes: number;
}

const STATUS_COLORS: Record<string, string> = {
  done: "oklch(0.696 0.17 148.02)",
  in_progress: "oklch(0.769 0.188 70.08)",
  not_started: "oklch(0.6 0.02 260)",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  strong: "oklch(0.696 0.17 148.02)",
  ok: "oklch(0.623 0.214 259.815)",
  weak: "oklch(0.637 0.237 25.331)",
};

const STATUS_LABELS: Record<string, string> = {
  done: "Done",
  in_progress: "In Progress",
  not_started: "Not Started",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  strong: "Strong",
  ok: "OK",
  weak: "Weak",
};

function computeActivityDateMap(logs: NodeActivityEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const log of logs) {
    if (log.action !== "marked_done") continue;
    const dateStr = toDateStr(new Date(log.timestamp));
    map.set(dateStr, (map.get(dateStr) ?? 0) + 1);
  }
  return map;
}

function computeDoneOverTime(logs: NodeActivityEntry[]): { date: string; count: number }[] {
  const now = new Date();
  const dateCounts = new Map<string, number>();
  for (const log of logs) {
    if (log.action !== "marked_done") continue;
    const dateStr = toDateStr(new Date(log.timestamp));
    dateCounts.set(dateStr, (dateCounts.get(dateStr) ?? 0) + 1);
  }

  const result: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push({ date: toDateStr(d), count: dateCounts.get(toDateStr(d)) ?? 0 });
  }
  return result;
}

function computeStatusBreakdown(nodes: NodeStoreItem[]): { name: string; value: number; color: string; label: string }[] {
  const counts: Record<string, number> = { done: 0, in_progress: 0, not_started: 0 };
  for (const node of nodes) {
    if (!isLeaf(nodes, node.id)) continue;
    const key = node.status ?? "not_started";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return ["done", "in_progress", "not_started"]
    .filter((key) => counts[key] > 0)
    .map((key) => ({
      name: key,
      value: counts[key],
      color: STATUS_COLORS[key],
      label: STATUS_LABELS[key],
    }));
}

function computeConfidenceBreakdown(nodes: NodeStoreItem[]): { name: string; value: number; color: string; label: string }[] {
  const counts: Record<string, number> = { strong: 0, ok: 0, weak: 0 };
  for (const node of nodes) {
    if (!isLeaf(nodes, node.id)) continue;
    if (!node.confidence) continue;
    counts[node.confidence] = (counts[node.confidence] ?? 0) + 1;
  }
  return ["strong", "ok", "weak"]
    .filter((key) => counts[key] > 0)
    .map((key) => ({
      name: key,
      value: counts[key],
      color: CONFIDENCE_COLORS[key],
      label: CONFIDENCE_LABELS[key],
    }));
}

/** Aggregates workspace nodes and activity logs into dashboard data (heatmap, streaks, breakdowns). */
export function computeWorkspaceDashboardData(
  nodes: NodeStoreItem[],
  logs: NodeActivityEntry[],
): WorkspaceDashboardData {
  const now = new Date();
  const activityMap = computeActivityDateMap(logs);
  const activityDateSet = new Set(activityMap.keys());

  const heatmap = computeHeatmap(now, activityMap);
  const { streak, maxStreak } = computeStreaks(activityDateSet, now);

  return {
    heatmap,
    streak,
    maxStreak,
    doneOverTime: computeDoneOverTime(logs),
    statusBreakdown: computeStatusBreakdown(nodes),
    confidenceBreakdown: computeConfidenceBreakdown(nodes),
    totalNodes: nodes.filter((n) => isLeaf(nodes, n.id)).length,
  };
}
