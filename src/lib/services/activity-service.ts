"use server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { toDateStr } from "@/lib/date-utils";
import { countConsecutiveDays } from "@/lib/streak-utils";
import {
  createActivityLog,
  findRecentActivity,
  findActivityCountsByDate,
  findDistinctActivityDates,
} from "@/lib/repositories/activity-log-repository";

export interface RecentActivityEntry {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solvedAt: string;
  topic: string;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface StreakData {
  streak: number;
  maxStreak: number;
}

export async function logActivity(
  problemId: string,
  activityType: "SOLVED" | "REVIEWED"
): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    await createActivityLog({
      problemId,
      userId: session.user.id,
      activityType,
    });
    return true;
  } catch (error) {
    logger.error("Failed to log activity", {
      problemId,
      activityType,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function getRecentActivity(
  limit: number = 10
): Promise<RecentActivityEntry[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const activities = await findRecentActivity(session.user.id, limit);
    return activities
      .filter((a) => a.problem)
      .map((a) => ({
        id: a.problem!.id,
        title: a.problem!.title,
        difficulty: a.problem!.difficulty as "EASY" | "MEDIUM" | "HARD",
        solvedAt: a.loggedAt.toISOString(),
        topic: a.problem!.topic.name,
      }));
  } catch (error) {
    logger.error("Failed to get recent activity", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export async function getHeatmapData(): Promise<HeatmapEntry[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const counts = await findActivityCountsByDate(session.user.id, startDate);
    const countMap = new Map<string, number>();
    for (const row of counts) {
      countMap.set(toDateStr(new Date(row.date)), Number(row.count));
    }

    const heatmap: HeatmapEntry[] = [];
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      heatmap.push({
        date: toDateStr(d),
        count: countMap.get(toDateStr(d)) ?? 0,
      });
    }
    return heatmap;
  } catch (error) {
    logger.error("Failed to get heatmap data", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export async function getStreakData(): Promise<StreakData> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { streak: 0, maxStreak: 0 };

    const now = new Date();
    const since = new Date(now.getFullYear(), 0, 1);
    const dates = await findDistinctActivityDates(session.user.id, since);

    if (dates.length === 0) return { streak: 0, maxStreak: 0 };

    const dateSet = new Set(dates.map((d) => toDateStr(d)));
    const streak = countConsecutiveDays(dateSet, now, "backward");

    let maxStreak = 0;
    const current = new Date(since);
    while (current <= now) {
      const s = countConsecutiveDays(dateSet, current, "forward");
      if (s > maxStreak) maxStreak = s;
      current.setDate(current.getDate() + (s || 1));
    }

    return { streak, maxStreak };
  } catch (error) {
    logger.error("Failed to get streak data", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { streak: 0, maxStreak: 0 };
  }
}
