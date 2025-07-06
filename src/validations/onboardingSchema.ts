import { z } from 'zod';
import { firstNameField, lastNameField } from './fieldsSchema';

export const onboardingSchema = z.object({
  firstName: firstNameField.optional(),
  lastName: lastNameField.optional(),
  nickname: z.string().max(30).optional(),
  image:
    z.custom<File | undefined>().refine((file) => !file || (file instanceof File && file.type.startsWith('image/')), {
      message: 'Please upload a valid image file.',
    })
      .refine(file => !file || file.size <= 1024 * 1024 * 4, "File size must be less than 4MB.")
      .optional(),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const serverOnboardingSchema = z.object({
  firstName: firstNameField.optional(),
  lastName: lastNameField.optional(),
  nickname: z.string().max(30).optional(),
  image: z.string().url().optional().nullable(),
  previousImage: z.string().url().optional().nullable(),
});

export type ServerOnboardingValues = z.infer<typeof serverOnboardingSchema>;

