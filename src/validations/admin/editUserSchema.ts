import { z } from "zod";
import { firstNameField, lastNameField, nicknameField, passwordField } from "../fieldsSchema";

export const editUserSchema = z.object({
  firstName: firstNameField,
  lastName: z.string().transform((val) => val === "" ? null : val),
  nickname: z.string().transform((val) => val === "" ? null : val),
  role: z.enum(["USER", "ADMIN"], {
    required_error: "Role is required",
  }),
  hasOnboarded: z.boolean(),
  // Optional image URL (will be set after upload)
  image: z.string().nullable().optional(),
  // Optional password change
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If password is provided, confirm password must match
  if (data.newPassword && data.newPassword.length > 0) {
    return data.confirmPassword === data.newPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type EditUserInput = z.infer<typeof editUserSchema>;