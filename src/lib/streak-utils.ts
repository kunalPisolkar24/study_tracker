import { toDateStr } from "@/lib/date-utils";

export interface HeatmapEntry {
  date: string;
  count: number;
}

export function countConsecutiveDays(
  dates: Set<string>,
  from: Date,
  direction: "backward" | "forward"
): number {
  let count = 0;
  const current = new Date(from);
  while (true) {
    const key = toDateStr(current);
    if (!dates.has(key)) break;
    count++;
    if (direction === "backward") {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
  }
  return count;
}

/**
 * Computes the current streak (consecutive days ending at `now`) and the
 * maximum streak within the current year starting from `now`. Scans forward
 * in chunks to avoid O(n²) pairwise checks.
 */
export function computeStreaks(
  dateSet: Set<string>,
  now: Date,
): { streak: number; maxStreak: number } {
  const streak = countConsecutiveDays(dateSet, now, "backward");
  let maxStreak = 0;
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const current = new Date(yearStart);
  while (current <= now) {
    const s = countConsecutiveDays(dateSet, current, "forward");
    if (s > maxStreak) maxStreak = s;
    current.setDate(current.getDate() + (s || 1));
  }
  return { streak, maxStreak };
}

/**
 * Generates a contiguous range of `Date` objects from `monthsBack` ago
 * through `now`. The start is aligned to the first of the month.
 */
export function buildDateRange(
  now: Date,
  monthsBack: number = 12,
): { start: Date; dates: Date[] } {
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
  const dates: Date[] = [];
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return { start, dates };
}

/**
 * Builds a heatmap entry array covering the past `monthsBack` months.
 * Each entry maps a date string to its count from `dateCounts`.
 */
export function computeHeatmap(
  now: Date,
  dateCounts: Map<string, number>,
  monthsBack: number = 12,
): HeatmapEntry[] {
  const { dates } = buildDateRange(now, monthsBack);
  return dates.map((d) => ({
    date: toDateStr(d),
    count: dateCounts.get(toDateStr(d)) ?? 0,
  }));
}
