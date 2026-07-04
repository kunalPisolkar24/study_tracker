import { toDateStr } from "@/lib/date-utils";

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
