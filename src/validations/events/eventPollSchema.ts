import { z } from "zod";

export const suggestLocationOptionSchema = z.object({
  eventId: z.string().min(1),
  label: z.string().min(1).max(200),
  addressFormatted: z.string().min(1).max(500),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type SuggestLocationOptionValues = z.infer<
  typeof suggestLocationOptionSchema
>;

export const voteLocationOptionSchema = z.object({
  eventId: z.string().min(1),
  optionId: z.string().min(1),
});

export type VoteLocationOptionValues = z.infer<typeof voteLocationOptionSchema>;

export const closeLocationPollSchema = z.object({
  eventId: z.string().min(1),
  winningOptionId: z.string().min(1).optional(),
});

export type CloseLocationPollValues = z.infer<typeof closeLocationPollSchema>;


