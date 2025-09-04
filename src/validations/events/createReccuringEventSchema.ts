import { z } from "zod";

export const createReccuringEventSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  interval: z.number().min(1).max(30).default(1),
  endType: z.enum(["never", "after", "on"]),
  endAfter: z.number().min(1).max(365).optional(),
  endDate: z.string().optional(),
  weekDays: z.array(z.number().min(0).max(6)).optional(),
}).optional();

export type CreateReccuringEventValues = z.infer<typeof createReccuringEventSchema>;