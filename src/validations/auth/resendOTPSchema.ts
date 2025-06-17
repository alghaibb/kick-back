import { z } from "zod";
import { emailField } from "../fields";

export const resendOTPSchema = z.object({
  email: emailField,
});

export type ResendOTPValues = z.infer<typeof resendOTPSchema>;