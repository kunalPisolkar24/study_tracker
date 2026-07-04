import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const activityLogInclude = {
  problem: {
    include: {
      topic: { select: { name: true } },
    },
  },
} satisfies Prisma.ActivityLogInclude;

export type ActivityLogWithProblem = Prisma.ActivityLogGetPayload<{
  include: typeof activityLogInclude;
}>;

export async function createActivityLog(data: {
  problemId: string;
  userId: string;
  activityType: "SOLVED" | "REVIEWED";
}) {
  return prisma.activityLog.create({ data });
}

export async function findRecentActivity(
  userId: string,
  limit: number = 10
): Promise<ActivityLogWithProblem[]> {
  return prisma.activityLog.findMany({
    where: { userId },
    include: activityLogInclude,
    orderBy: { loggedAt: "desc" },
    take: limit,
  });
}

export async function findActivityCountsByDate(
  userId: string,
  startDate: Date
): Promise<Array<{ date: Date; count: bigint }>> {
  return prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE(logged_at) as date, COUNT(*)::bigint as count
    FROM activity_logs
    WHERE user_id = ${userId} AND logged_at >= ${startDate}
    GROUP BY DATE(logged_at)
    ORDER BY date ASC
  `;
}

export async function findDistinctActivityDates(
  userId: string,
  since: Date
): Promise<Date[]> {
  const result = await prisma.$queryRaw<Array<{ logged_at: Date }>>`
    SELECT DISTINCT DATE(logged_at) as logged_at
    FROM activity_logs
    WHERE user_id = ${userId} AND logged_at >= ${since}
    ORDER BY logged_at DESC
  `;
  return result.map((r) => r.logged_at);
}
