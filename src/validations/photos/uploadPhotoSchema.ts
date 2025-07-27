import { z } from "zod";

export const uploadPhotoSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  caption: z
    .string()
    .max(500, "Caption must be less than 500 characters")
    .optional(),
});

export const likePhotoSchema = z.object({
  photoId: z.string().min(1, "Photo ID is required"),
});

export const deletePhotoSchema = z.object({
  photoId: z.string().min(1, "Photo ID is required"),
});

export type UploadPhotoValues = z.infer<typeof uploadPhotoSchema>;
export type LikePhotoValues = z.infer<typeof likePhotoSchema>;
export type DeletePhotoValues = z.infer<typeof deletePhotoSchema>;
