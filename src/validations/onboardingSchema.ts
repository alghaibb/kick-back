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
  reminderType: z.enum(["email", "sms", "both"]),
  phoneNumber: z
    .string()
    .regex(/^(\+61|0)[2-478]\d{8}$/, "Please enter a valid Australian phone number")
    .optional(),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  timezone: z.string().min(1, "Timezone is required"),
}).refine((data) => {
  if ((data.reminderType === "sms" || data.reminderType === "both") && !data.phoneNumber) {
    return false;
  }
  return true;
}, {
  message: "Phone number is required for SMS reminders",
  path: ["phoneNumber"],
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
  reminderType: z.enum(["email", "sms", "both"]).default("email"),
  phoneNumber: z.string().optional().nullable(),
  reminderTime: z.string().default("09:00"),
  timezone: z.string().min(1, "Timezone is required"),
});
