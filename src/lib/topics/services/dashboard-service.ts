"use server";

import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/shared/logger";
import { findTopicsByUserId } from "@/lib/topics/repositories/topic-repository";
import { mapPrismaTopic } from "@/lib/topics/mappers";
import { computeDashboardData } from "@/lib/topics/dashboard-data";
import type { DashboardData } from "@/lib/topics/dashboard-data";

export type { DashboardData } from "@/lib/topics/dashboard-data";

export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const topics = await findTopicsByUserId(session.user.id);
    const storeItems = topics.map(mapPrismaTopic);
    return computeDashboardData(storeItems);
  } catch (error) {
    logger.error("Failed to get dashboard data", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
