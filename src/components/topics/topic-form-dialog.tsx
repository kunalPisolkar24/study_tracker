"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createTopicSchema, updateTopicSchema } from "@/lib/schemas";
import { useFormDialog } from "@/components/topics/use-form-dialog";
import type { CreateTopicInput } from "@/lib/schemas";

interface TopicFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateTopicInput) => Promise<boolean>;
  initialValues?: {
    name: string;
    description?: string;
  };
}

export function TopicFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: TopicFormDialogProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const { isSubmitting, submit } = useFormDialog();

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Topic" : "Create Topic";
  const descriptionText = isEdit
    ? "Update the topic details below."
    : "Add a new topic to track your problems.";

  async function handleSubmit() {
    setErrors({});
    const schema = isEdit ? updateTopicSchema : createTopicSchema;
    const result = schema.safeParse({
      name: name.trim() || undefined,
      description: description.trim() || undefined,
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.name?.[0]) {
        setErrors({ name: fieldErrors.name[0] });
      }
      return;
    }

    if (isEdit) {
      onSubmit(result.data as CreateTopicInput);
      onOpenChange(false);
    } else {
      const ok = await submit(
        () => onSubmit(result.data as CreateTopicInput),
        { errorMessage: "Failed to create topic" }
      );
      if (ok) {
        setName("");
        setDescription("");
        onOpenChange(false);
      }
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
            <Label htmlFor="topic-name">Name</Label>
            <Input
              id="topic-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Arrays & Hashing"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic-description">Description</Label>
            <Textarea
              id="topic-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this topic..."
              disabled={isSubmitting}
            />
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
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
