"use server";

import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/shared/logger";
import { createActivityLog } from "@/lib/topics/repositories/activity-log-repository";

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


