import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  groupId: z.string().nullable().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  groupId: z.string().nullable().optional(),
});

export const createWorkspaceGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
});

export const updateWorkspaceGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type CreateWorkspaceGroupInput = z.infer<typeof createWorkspaceGroupSchema>;
export type UpdateWorkspaceGroupInput = z.infer<typeof updateWorkspaceGroupSchema>;
