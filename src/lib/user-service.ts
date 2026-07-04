import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function upsertGoogleUser(
  email: string,
  name?: string | null,
): Promise<boolean> {
  try {
    await prisma.user.upsert({
      where: { email },
      create: { email, name: name ?? undefined },
      update: { name: name ?? undefined },
    });
    return true;
  } catch (error) {
    logger.error("Failed to upsert Google user", {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
