"use server";

import { auth } from "@/lib/auth/auth";
import { seedUserData } from "@/lib/seed/seed-user";
import { prisma } from "@/lib/shared/prisma";

export async function seedUserDataAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await seedUserData(session.user.id, prisma);
}

export async function hasUserDataAction(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const count = await prisma.workspaceGroup.count({ where: { userId: session.user.id } });
  return count > 0;
}
