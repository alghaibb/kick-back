import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long")
    .describe("Comment content"),
  eventId: z.string().min(1, "Event ID is required").describe("Event ID"),
  parentId: z.string().optional().describe("Parent comment ID for replies"),
  imageUrl: z.string().url().optional().describe("Optional image attachment"),
});

export const replyCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(500, "Reply is too long")
    .describe("Reply content"),
  eventId: z.string().min(1, "Event ID is required").describe("Event ID"),
  parentId: z.string().min(1, "Parent comment ID is required").describe("Parent comment ID"),
  imageUrl: z.string().url().optional().describe("Optional image attachment"),
});

export const commentReactionSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required").describe("Comment ID"),
  emoji: z
    .string()
    .min(1, "Emoji is required")
    .max(10, "Invalid emoji")
    .describe("Reaction emoji"),
});

export const commentSortSchema = z.object({
  sortBy: z.enum(["newest", "oldest"]).default("newest").describe("Sort order"),
});

export type CreateCommentValues = z.infer<typeof createCommentSchema>;
export type ReplyCommentValues = z.infer<typeof replyCommentSchema>;
export type CommentReactionValues = z.infer<typeof commentReactionSchema>;
export type CommentSortValues = z.infer<typeof commentSortSchema>;
