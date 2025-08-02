import { z } from "zod";

export const contactReplySchema = z.object({
  contactId: z.string().min(1, "Contact ID is required"),
  replyMessage: z
    .string()
    .min(1, "Reply message is required")
    .max(2000, "Reply message must be less than 2000 characters"),
});

export type ContactReplyValues = z.infer<typeof contactReplySchema>;
