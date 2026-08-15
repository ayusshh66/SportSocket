import { z } from "zod";

export const listCommentaryQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .positive("Limit must be a positive number")
    .max(100, "Limit cannot exceed 100")
    .optional(),
});

export const createCommentarySchema = z.object({
  minute: z
    .number()
    .int("Minute must be an integer")
    .nonnegative("Minute must be a non-negative integer")
    .optional(),
  sequence: z.number().int("Sequence must be an integer").optional(),
  period: z.string().optional(),
  eventType: z.string().optional(),
  actor: z.string().optional(),
  team: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  metadata: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

export type ListCommentaryQuery = z.infer<typeof listCommentaryQuerySchema>;
export type CreateCommentaryInput = z.infer<typeof createCommentarySchema>;
