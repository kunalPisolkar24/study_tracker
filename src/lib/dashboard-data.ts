import type { TopicStoreItem } from "@/types/topics";
import { getAllProblems } from "@/lib/topic-utils";
import { toDateStr } from "@/lib/date-utils";
import { countConsecutiveDays } from "@/lib/streak-utils";

export interface DifficultyStats {
  solved: number;
  total: number;
}

export interface TopicRadarEntry {
  topic: string;
  solved: number;
}

export interface RecentActivityEntry {
  id: string;
  title: string;
  status: "TODO" | "ATTEMPTED" | "SOLVED" | "MARKED_FOR_REVIEW";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solvedAt: string;
  topic: string;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface WeeklySolvedEntry {
  date: string;
  count: number;
}

export interface DashboardData {
  solvedToday: number;
  streak: number;
  maxStreak: number;
  weeklySolved: WeeklySolvedEntry[];
  difficultyBreakdown: Record<"EASY" | "MEDIUM" | "HARD", DifficultyStats>;
  totalSolved: number;
  totalProblems: number;
  topicRadar: TopicRadarEntry[];
  reviewStats: { solved: number; markedForReview: number };
  heatmap: HeatmapEntry[];
  recentActivity: RecentActivityEntry[];
}

function flattenProblems(topics: TopicStoreItem[]): { problem: TopicStoreItem["problems"][number]; topicName: string }[] {
  const seen = new Set<string>();
  const result: ReturnType<typeof flattenProblems> = [];
  for (const topic of topics) {
    const problems = getAllProblems(topic);
    for (const p of problems) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        result.push({ problem: p, topicName: topic.name });
      }
    }
  }
  return result;
}

function computeDifficultyBreakdown(
  allProblems: { problem: TopicStoreItem["problems"][number] }[]
): Record<"EASY" | "MEDIUM" | "HARD", DifficultyStats> {
  const breakdown: Record<"EASY" | "MEDIUM" | "HARD", DifficultyStats> = {
    EASY: { solved: 0, total: 0 },
    MEDIUM: { solved: 0, total: 0 },
    HARD: { solved: 0, total: 0 },
  };
  for (const { problem } of allProblems) {
    const bucket = breakdown[problem.difficulty];
    bucket.total++;
    if (problem.status === "SOLVED") bucket.solved++;
  }
  return breakdown;
}

function computeTopicRadarData(
  solvedProblems: { problem: TopicStoreItem["problems"][number]; topicName: string }[]
): TopicRadarEntry[] {
  const topicSolveCount = new Map<string, number>();
  for (const { topicName } of solvedProblems) {
    topicSolveCount.set(topicName, (topicSolveCount.get(topicName) ?? 0) + 1);
  }
  return Array.from(topicSolveCount.entries())
    .map(([topic, solved]) => ({ topic, solved }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 6);
}

function computeSolveDateMap(
  solvedProblems: { problem: TopicStoreItem["problems"][number] }[]
): { solveDateCounts: Map<string, number>; solveDateSet: Set<string>; allSolveDates: string[] } {
  const solveDateCounts = new Map<string, number>();
  const allSolveDates: string[] = [];
  for (const { problem } of solvedProblems) {
    if (!problem.solvedAt) continue;
    const dateStr = toDateStr(new Date(problem.solvedAt));
    solveDateCounts.set(dateStr, (solveDateCounts.get(dateStr) ?? 0) + 1);
    allSolveDates.push(dateStr);
  }
  return { solveDateCounts, solveDateSet: new Set(allSolveDates), allSolveDates };
}

function computeWeeklySolved(now: Date, solveDateCounts: Map<string, number>): WeeklySolvedEntry[] {
  const weekly: WeeklySolvedEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    weekly.push({ date: toDateStr(d), count: solveDateCounts.get(toDateStr(d)) ?? 0 });
  }
  return weekly;
}

function computeStreaks(solveDateSet: Set<string>, now: Date): { streak: number; maxStreak: number } {
  const streak = countConsecutiveDays(solveDateSet, now, "backward");
  let maxStreak = 0;
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const current = new Date(yearStart);
  while (current <= now) {
    const s = countConsecutiveDays(solveDateSet, current, "forward");
    if (s > maxStreak) maxStreak = s;
    current.setDate(current.getDate() + (s || 1));
  }
  return { streak, maxStreak };
}

function computeHeatmap(now: Date, solveDateCounts: Map<string, number>): HeatmapEntry[] {
  const heatmap: HeatmapEntry[] = [];
  const start = new Date(now.getFullYear(), 0, 1);
  start.setFullYear(start.getFullYear() - 1);
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    heatmap.push({ date: toDateStr(d), count: solveDateCounts.get(toDateStr(d)) ?? 0 });
  }
  return heatmap;
}

function computeRecentActivity(
  solvedProblems: { problem: TopicStoreItem["problems"][number]; topicName: string }[]
): RecentActivityEntry[] {
  const seen = new Set<string>();
  return solvedProblems
    .filter(({ problem }) => {
      if (!problem.solvedAt || seen.has(problem.id)) return false;
      seen.add(problem.id);
      return true;
    })
    .map(({ problem, topicName }) => ({
      id: problem.id,
      title: problem.title,
      status: problem.status,
      difficulty: problem.difficulty,
      solvedAt: problem.solvedAt!,
      topic: topicName,
    }))
    .sort((a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime())
    .slice(0, 10);
}

export function computeDashboardData(topics: TopicStoreItem[]): DashboardData {
  const now = new Date();
  const todayStr = toDateStr(now);

  const allProblems = flattenProblems(topics);
  const totalProblems = allProblems.length;

  const solvedProblems = allProblems.filter(({ problem }) => problem.status === "SOLVED");
  const totalSolved = solvedProblems.length;
  const markedForReview = allProblems.filter(
    ({ problem }) => problem.status === "MARKED_FOR_REVIEW"
  ).length;

  const solvedToday = solvedProblems.filter(
    ({ problem }) => problem.solvedAt && toDateStr(new Date(problem.solvedAt)) === todayStr
  ).length;

  const difficultyBreakdown = computeDifficultyBreakdown(allProblems);
  const topicRadar = computeTopicRadarData(solvedProblems);
  const { solveDateCounts, solveDateSet } = computeSolveDateMap(solvedProblems);
  const weeklySolved = computeWeeklySolved(now, solveDateCounts);
  const { streak, maxStreak } = computeStreaks(solveDateSet, now);
  const heatmap = computeHeatmap(now, solveDateCounts);
  const recentActivity = computeRecentActivity(solvedProblems);

  return {
    solvedToday,
    streak,
    maxStreak,
    weeklySolved,
    difficultyBreakdown,
    totalSolved,
    totalProblems,
    topicRadar,
    reviewStats: { solved: totalSolved, markedForReview },
    heatmap,
    recentActivity,
  };
}
