"use server";

import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import {
  uploadPhotoSchema,
  likePhotoSchema,
  deletePhotoSchema,
} from "@/validations/photos/uploadPhotoSchema";
import { revalidatePath } from "next/cache";

export async function savePhotoMetadataAction(data: {
  eventId: string;
  imageUrl: string;
  caption?: string;
}) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "You must be logged in to save photos" };
    }

    const validation = uploadPhotoSchema.safeParse({
      eventId: data.eventId,
      caption: data.caption,
    });
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || "Invalid data" };
    }

    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: {
        attendees: { where: { userId: session.user.id } },
        group: {
          include: {
            members: { where: { userId: session.user.id } },
          },
        },
      },
    });

    if (!event) {
      return { error: "Event not found" };
    }

    const canUpload =
      event.createdBy === session.user.id ||
      event.attendees.length > 0 ||
      (event.group && event.group.members.length > 0);

    if (!canUpload) {
      return {
        error: "You don't have permission to upload photos to this event",
      };
    }

    const photo = await prisma.eventPhoto.create({
      data: {
        eventId: data.eventId,
        userId: session.user.id,
        imageUrl: data.imageUrl,
        caption: data.caption || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            nickname: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    revalidatePath(`/events`);
    return { success: true, photo };
  } catch (error) {
    console.error("Save photo metadata error:", error);
    return { error: "Failed to save photo" };
  }
}

export async function likePhotoAction(data: { photoId: string }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "You must be logged in to like photos" };
    }

    const validation = likePhotoSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || "Invalid data" };
    }

    const existingLike = await prisma.eventPhotoLike.findUnique({
      where: {
        photoId_userId: {
          photoId: data.photoId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.eventPhotoLike.delete({
        where: { id: existingLike.id },
      });
      return { success: true, liked: false };
    } else {
      await prisma.eventPhotoLike.create({
        data: {
          photoId: data.photoId,
          userId: session.user.id,
        },
      });
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Like photo error:", error);
    return { error: "Failed to like photo" };
  }
}

export async function deletePhotoAction(data: { photoId: string }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "You must be logged in to delete photos" };
    }

    const validation = deletePhotoSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || "Invalid data" };
    }

    const photo = await prisma.eventPhoto.findUnique({
      where: { id: data.photoId },
    });

    if (!photo) {
      return { error: "Photo not found" };
    }

    if (photo.userId !== session.user.id) {
      return { error: "You can only delete your own photos" };
    }

    await prisma.eventPhoto.delete({
      where: { id: data.photoId },
    });

    revalidatePath(`/events`);
    return { success: true };
  } catch (error) {
    console.error("Delete photo error:", error);
    return { error: "Failed to delete photo" };
  }
}
