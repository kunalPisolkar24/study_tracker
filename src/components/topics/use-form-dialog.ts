"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useFormDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(
    action: () => Promise<boolean> | void,
    options?: { successMessage?: string; errorMessage?: string }
  ): Promise<boolean> {
    setIsSubmitting(true);
    try {
      const result = await action();
      const success = result !== false;
      if (success && options?.successMessage) {
        toast.success(options.successMessage);
      } else if (!success && options?.errorMessage) {
        toast.error(options.errorMessage);
      }
      return success;
    } catch {
      toast.error(options?.errorMessage ?? "An unexpected error occurred");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, setIsSubmitting, submit };
}
