import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  nicknameField,
  passwordField,
} from "../fieldsSchema";

// Profile update schema (without password change)
export const updateProfileSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  nickname: nicknameField,
  email: emailField,
  image: z.string().optional().nullable(),
});

// Password change schema (only for users with passwords)
export const changePasswordSchema = z
  .object({
    currentPassword: passwordField,
    newPassword: passwordField,
    confirmNewPassword: passwordField,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

// Type exports
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
