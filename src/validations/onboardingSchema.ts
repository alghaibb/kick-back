import { z } from 'zod';
import { firstNameField, lastNameField } from './fieldsSchema';

export const onboardingSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  nickname: z
    .string()
    .min(1, "Nickname must be at least 1 character")
    .max(30, "Nickname must be less than 30 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Nickname can only contain letters, numbers, spaces, hyphens, and underscores")
    .optional()
    .or(z.literal("")),
  image: z
    .custom<File | undefined>()
    .refine(
      (file) => !file || (file instanceof File && file.type.startsWith('image/')),
      {
        message: 'Please upload a valid image file (JPEG, PNG, GIF, etc.)',
      }
    )
    .refine(
      (file) => !file || file.size <= 4 * 1024 * 1024,
      "Image must be less than 4MB"
    )
    .optional(),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const serverOnboardingSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  nickname: z
    .string()
    .min(1, "Nickname must be at least 1 character")
    .max(30, "Nickname must be less than 30 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Nickname can only contain letters, numbers, spaces, hyphens, and underscores")
    .optional()
    .or(z.literal("")),
  image: z.string().url().optional().nullable(),
  previousImage: z.string().url().optional().nullable(),
});

export type ServerOnboardingValues = z.infer<typeof serverOnboardingSchema>;

