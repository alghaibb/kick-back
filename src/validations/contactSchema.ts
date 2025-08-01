import { z } from "zod";
import { emailField, firstNameField, lastNameField } from "./fieldsSchema";

export const contactSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  email: emailField,
  subject: z
    .string()
    .min(1, { message: "Subject is required" })
    .max(100, { message: "Subject is too long" })
    .trim(),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message is too long" })
    .trim(),
});

export type ContactValues = z.infer<typeof contactSchema>;
