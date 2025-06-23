import { z } from 'zod';
import { emailField, firstNameField, lastNameField, passwordField } from '../fields';

export const accountSettingsSchema = z
  .object({
    email: emailField,
    firstName: firstNameField,
    lastName: lastNameField,
    nickname: z.string().max(50).trim().optional(),
    newPassword: passwordField.optional(),
    confirmPassword: z.string().optional(),
    image: z.any().optional(),
    previousImage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      typeof data.newPassword === 'string' &&
      data.newPassword.length > 0 &&
      data.newPassword !== data.confirmPassword
    ) {
      ctx.addIssue({
        path: ['confirmPassword'],
        message: 'Passwords do not match',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type AccountSettingsValues = z.infer<typeof accountSettingsSchema>;
