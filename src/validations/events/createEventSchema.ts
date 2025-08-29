import { z } from "zod";

export const createEventSchema = z.object({
  name: z
    .string()
    .min(1, "Event Name is required")
    .max(50, "Event Name is too long")
    .describe("Event Name"),
  description: z.string().max(500).optional().describe("Description"),
  location: z.string().max(200).optional().describe("Location"),
  date: z.string({ required_error: "Date is required" }).refine((dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }, "Invalid date format"),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
  groupId: z.string().optional().nullable(),
});

export type CreateEventValues = z.infer<typeof createEventSchema>;
