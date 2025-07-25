import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string()
    .min(2, "Group name must be at least 2 characters.")
    .max(50, "Group name must be at most 50 characters."),
  description: z.string().max(255, "Description must be at most 255 characters.").optional(),
  image: z
    .custom<File | undefined>()
    .optional(),
});

export type CreateGroupValues = z.infer<typeof createGroupSchema>;

export const serverCreateGroupSchema = z.object({
  name: z.string()
    .min(2, "Group name must be at least 2 characters.")
    .max(50, "Group name must be at most 50 characters."),
  description: z.string().max(255, "Description must be at most 255 characters.").optional(),
  image: z.string().url("Image must be a valid URL.").optional().nullable(),
});

export type ServerCreateGroupValues = z.infer<typeof serverCreateGroupSchema>;