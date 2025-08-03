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