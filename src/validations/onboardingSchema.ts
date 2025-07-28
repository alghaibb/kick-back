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
  image: z.string().optional().nullable(),
  previousImage: z.string().optional().nullable(),
  reminderType: z.enum(["email", "sms", "both"]),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (val) => !val || val === "" || /^(\+61|0)[2-478]\d{8}$/.test(val),
      "Please enter a valid phone number"
    )
    .optional()
    .or(z.literal("")),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  timezone: z.string().min(1, "Timezone is required"),
}).refine((data) => {
  if ((data.reminderType === "sms" || data.reminderType === "both") && (!data.phoneNumber || data.phoneNumber.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Phone number is required for SMS reminders",
  path: ["phoneNumber"],
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;