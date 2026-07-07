"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspaceGroupSchema, updateWorkspaceGroupSchema } from "@/lib/workspace/workspace-schemas";
import type { CreateWorkspaceGroupInput } from "@/lib/workspace/workspace-schemas";

interface GroupFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateWorkspaceGroupInput) => Promise<boolean>;
  initialValues?: {
    name: string;
  };
}

export function GroupFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: GroupFormDialogProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Group" : "Create Group";
  const descriptionText = isEdit
    ? "Update the group name below."
    : "Add a new group to organize your workspaces.";

  async function handleSubmit() {
    setErrors({});
    const schema = isEdit ? updateWorkspaceGroupSchema : createWorkspaceGroupSchema;
    const result = schema.safeParse({
      name: name.trim() || undefined,
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.name?.[0]) {
        setErrors({ name: fieldErrors.name[0] });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onSubmit(result.data as CreateWorkspaceGroupInput);
      if (ok) {
        setName("");
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Core Subjects"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
