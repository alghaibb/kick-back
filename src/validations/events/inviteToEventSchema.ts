import { emailField } from "../fieldsSchema";
import { z } from "zod";

export const inviteToEventSchema = z.object({
  email: emailField,
});

export type InviteToEventValues = z.infer<typeof inviteToEventSchema>;

export const inviteToEventFormSchema = z.object({
  emails: z.array(emailField),
});

export type InviteToEventFormValues = z.infer<typeof inviteToEventFormSchema>;

export const inviteToEventBatchSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  emails: z.array(emailField).min(1, "At least one email is required"),
});

export type InviteToEventBatchValues = z.infer<typeof inviteToEventBatchSchema>;
