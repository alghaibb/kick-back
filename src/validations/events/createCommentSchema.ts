import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment is too long")
    .describe("Comment"),
  eventId: z.string().min(1, "Event ID is required").describe("Event ID"),
});

export type CreateCommentValues = z.infer<typeof createCommentSchema>;
