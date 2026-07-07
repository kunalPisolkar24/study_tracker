import { z } from "zod";

const DifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
const ProblemStatusEnum = z.enum([
  "TODO",
  "ATTEMPTED",
  "SOLVED",
  "MARKED_FOR_REVIEW",
]);

export const createTopicSchema = z.object({
  name: z
    .string()
    .min(1, "Topic name is required")
    .max(255, "Topic name must be 255 characters or less"),
  description: z.string().max(2000).optional(),
});

export const updateTopicSchema = z.object({
  name: z
    .string()
    .min(1, "Topic name is required")
    .max(255, "Topic name must be 255 characters or less")
    .optional(),
  description: z.string().max(2000).optional(),
});

export const createSubTopicSchema = z.object({
  topicId: z.string().min(1, "Topic is required"),
  name: z
    .string()
    .min(1, "Sub-topic name is required")
    .max(255, "Sub-topic name must be 255 characters or less"),
  description: z.string().max(2000).optional(),
});

export const updateSubTopicSchema = z.object({
  name: z
    .string()
    .min(1, "Sub-topic name is required")
    .max(255, "Sub-topic name must be 255 characters or less")
    .optional(),
  description: z.string().max(2000).optional(),
});

export const createProblemSchema = z.object({
  topicId: z.string().min(1, "Topic is required"),
  subTopicId: z.string().optional(),
  title: z
    .string()
    .min(1, "Problem title is required")
    .max(500, "Problem title must be 500 characters or less"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  difficulty: DifficultyEnum,
  notes: z.string().max(5000).optional(),
});

export const updateProblemSchema = z.object({
  title: z
    .string()
    .min(1, "Problem title is required")
    .max(500)
    .optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  difficulty: DifficultyEnum.optional(),
  subTopicId: z.string().nullable().optional(),
  notes: z.string().max(5000).optional(),
});

export const updateProblemStatusSchema = z.object({
  status: ProblemStatusEnum,
});

export const updateProblemReviewCountSchema = z.object({
  reviewCount: z.number().int().min(0),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type CreateSubTopicInput = z.infer<typeof createSubTopicSchema>;
export type UpdateSubTopicInput = z.infer<typeof updateSubTopicSchema>;
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;
