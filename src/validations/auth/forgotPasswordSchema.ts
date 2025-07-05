import { z } from "zod";
import { emailField } from "../fieldsSchema";

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;