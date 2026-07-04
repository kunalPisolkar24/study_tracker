"use server";

import { signIn } from "@/lib/auth";
import { signInSchema } from "@/lib/schemas";

interface ActionResult {
  error: string | null;
}

export async function signInAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      fieldErrors.email?.[0] ?? fieldErrors.password?.[0] ?? "Invalid input";
    return { error: firstError };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { error: null };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      (error as { type: string }).type === "CredentialsSignin"
    ) {
      return { error: "Invalid email or password" };
    }
    return { error: "Something went wrong. Please try again." };
  }
}
