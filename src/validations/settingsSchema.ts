import { z } from "zod";

export const settingsSchema = z.object({
  reminderType: z.enum(["email", "sms", "both"]),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  timezone: z.string().min(1, "Timezone is required"),
  phoneNumber: z.string().optional().or(z.literal("")),
  notificationOptIn: z.boolean(),
  inAppNotifications: z.boolean(),
  pushNotifications: z.boolean(),
}).refine((data) => {
  if ((data.reminderType === "sms" || data.reminderType === "both") && !data.phoneNumber) {
    return false;
  }
  return true;
}, {
  message: "Phone number is required for SMS reminders",
  path: ["phoneNumber"],
});

export type SettingsValues = z.infer<typeof settingsSchema>; 