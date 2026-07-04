"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { redirect } from "next/navigation";
import { signUpSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";

interface ActionResult {
  error: string | null;
}

export async function signUpAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      fieldErrors.name?.[0] ??
      fieldErrors.email?.[0] ??
      fieldErrors.password?.[0] ??
      fieldErrors.confirmPassword?.[0] ??
      "Invalid input";
    return { error: firstError };
  }

  const { name, email, password } = parsed.data;

  try {
    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: { name, email, hashedPassword },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { error: "An account with this email already exists" };
    }
    logger.error("Registration failed", {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/login");
}
