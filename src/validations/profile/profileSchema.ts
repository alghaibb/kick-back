import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  nicknameField,
  passwordField,
} from "../fieldsSchema";

export const updateProfileSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  nickname: nicknameField,
  email: emailField,
  image: z.string().optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: passwordField,
  newPassword: passwordField,
  confirmPassword: passwordField,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
