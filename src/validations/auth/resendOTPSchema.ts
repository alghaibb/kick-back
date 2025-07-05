import { z } from "zod";
import { emailField } from "../fieldsSchema";

export const resendOTPSchema = z.object({
  email: emailField,
});

export type ResendOTPValues = z.infer<typeof resendOTPSchema>;