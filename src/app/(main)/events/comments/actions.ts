"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import {
  createCommentSchema,
  CreateCommentValues,
} from "@/validations/events/createCommentSchema";
import { revalidatePath } from "next/cache";
import { notifyEventComment } from "@/lib/notification-triggers";

export async function createCommentAction(values: CreateCommentValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Validate comment fields
    const validatedFields = createCommentSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { content, eventId } = validatedFields.data;

    // Check if user is event attendee or event is in their group
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        attendees: {
          where: { userId: session.user.id },
        },
        group: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!event) {
      return { error: "Event not found" };
    }

    // Check if user has access (is attendee or group member)
    const isAttendee = event.attendees.length > 0;
    const isGroupMember = (event.group?.members?.length ?? 0) > 0;

    if (!isAttendee && !isGroupMember) {
      return {
        error: "You must be an event attendee or group member to comment",
      };
    }

    const comment = await prisma.eventComment.create({
      data: {
        content,
        eventId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nickname: true,
            image: true,
          },
        },
      },
    });

    // Send notifications to other event attendees
    try {
      const eventAttendees = await prisma.eventAttendee.findMany({
        where: {
          eventId,
          userId: { not: session.user.id }, // Exclude the commenter
        },
        select: { userId: true },
      });

      if (eventAttendees.length > 0) {
        await notifyEventComment({
          eventId,
          eventName: event.name,
          commenterName: comment.user.nickname || comment.user.firstName,
          eventAttendeeIds: eventAttendees.map((attendee) => attendee.userId),
        });
      }
    } catch (notificationError) {
      console.error("Failed to send comment notifications:", notificationError);
      // Don't fail the comment creation if notifications fail
    }

    revalidatePath("/events");
    revalidatePath("/calendar");
    return { success: true, comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { error: "An error occurred. Please try again." };
  }
}

export async function deleteCommentAction(commentId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const comment = await prisma.eventComment.findUnique({
      where: { id: commentId },
      select: { userId: true, eventId: true },
    });

    if (!comment) {
      return { error: "Comment not found" };
    }

    if (comment.userId !== session.user.id) {
      return { error: "You can only delete your own comments" };
    }

    await prisma.eventComment.delete({
      where: { id: commentId },
    });

    revalidatePath("/events");
    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { error: "An error occurred. Please try again." };
  }
}
