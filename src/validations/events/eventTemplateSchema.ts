import { z } from "zod";

export const createEventTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(50, "Template name is too long"),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)")
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
  groupId: z.string().optional().nullable(),
});

export type CreateEventTemplateValues = z.infer<
  typeof createEventTemplateSchema
>;

export const editEventTemplateSchema = createEventTemplateSchema;
export type EditEventTemplateValues = z.infer<typeof editEventTemplateSchema>;

export const useEventTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  date: z.string({ required_error: "Date is required" }).refine((dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }, "Invalid date format"),
  // Allow overriding template defaults
  name: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  time: z.string().optional(),
  groupId: z.string().optional().nullable(),
});

export type UseEventTemplateValues = z.infer<typeof useEventTemplateSchema>;
