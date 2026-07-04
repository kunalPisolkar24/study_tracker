"use server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { findTopicsByUserId } from "@/lib/repositories/topic-repository";
import { mapPrismaTopic } from "@/lib/mappers";
import { computeDashboardData } from "@/lib/dashboard-data";
import type { DashboardData } from "@/lib/dashboard-data";

export type { DashboardData } from "@/lib/dashboard-data";

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
