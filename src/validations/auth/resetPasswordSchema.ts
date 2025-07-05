import { z } from "zod";
import { passwordField } from "../fieldsSchema";

export const resetPasswordSchema = z
  .object({
    newPassword: passwordField,
    newConfirmPassword: passwordField,
  })
  .refine((data) => data.newPassword === data.newConfirmPassword, {
    message: "Passwords do not match",
    path: ["newConfirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
