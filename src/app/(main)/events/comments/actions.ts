"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import {
  createCommentSchema,
  CreateCommentValues,
  replyCommentSchema,
  ReplyCommentValues,
  commentReactionSchema,
  CommentReactionValues,
} from "@/validations/events/createCommentSchema";
import { revalidatePath } from "next/cache";
import {
  notifyEventComment,
  notifyCommentReply,
  notifyCommentReaction
} from "@/lib/notification-triggers";

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

    const { content, eventId, parentId, imageUrl } = validatedFields.data;

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
        parentId,
        imageUrl,
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
        replies: {
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
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    nickname: true,
                  },
                },
              },
            },
            _count: {
              select: {
                replies: true,
                reactions: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
            reactions: true,
          },
        },
      },
    });

    // Send notifications to other event attendees (only for main comments, not replies)
    if (!parentId) {
      try {
        const eventAttendees = await prisma.eventAttendee.findMany({
          where: {
            eventId,
            userId: { not: session.user.id },
          },
          include: { user: true },
        });

        await notifyEventComment({
          eventId,
          eventName: event.name,
          commenterName: comment.user.nickname || comment.user.firstName,
          eventAttendeeIds: eventAttendees.map((attendee) => attendee.userId),
        });
      } catch (error) {
        console.error("Error sending comment notifications:", error);
      }
    }

    revalidatePath("/events");
    revalidatePath("/calendar");
    return { success: true, comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { error: "An error occurred. Please try again." };
  }
}

export async function createReplyAction(values: ReplyCommentValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Validate reply fields
    const validatedFields = replyCommentSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { content, eventId, parentId, imageUrl } = validatedFields.data;

    // Check if parent comment exists and user has access
    const parentComment = await prisma.eventComment.findUnique({
      where: { id: parentId },
      include: {
        event: {
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
        },
      },
    });

    if (!parentComment) {
      return { error: "Parent comment not found" };
    }

    const isAttendee = parentComment.event.attendees.length > 0;
    const isGroupMember = (parentComment.event.group?.members?.length ?? 0) > 0;

    if (!isAttendee && !isGroupMember) {
      return {
        error: "You must be an event attendee or group member to reply",
      };
    }

    const reply = await prisma.eventComment.create({
      data: {
        content,
        eventId,
        userId: session.user.id,
        parentId,
        imageUrl,
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
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
            reactions: true,
          },
        },
      },
    });

    // Send notification to parent comment author
    try {
      await notifyCommentReply({
        parentCommentUserId: parentComment.userId,
        replierId: session.user.id,
        replierName: reply.user.nickname || reply.user.firstName,
        eventId,
        eventName: parentComment.event.name,
        commentId: reply.id,
      });
    } catch (error) {
      console.error("Error sending reply notification:", error);
    }

    revalidatePath("/events");
    revalidatePath("/calendar");
    return { success: true, comment: reply };
  } catch (error) {
    console.error("Error creating reply:", error);
    return { error: "An error occurred. Please try again." };
  }
}

export async function toggleReactionAction(values: CommentReactionValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Validate reaction fields
    const validatedFields = commentReactionSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { commentId, emoji } = validatedFields.data;

    // Check if user has access to this comment
    const comment = await prisma.eventComment.findUnique({
      where: { id: commentId },
      include: {
        event: {
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
        },
      },
    });

    if (!comment) {
      return { error: "Comment not found" };
    }

    const isAttendee = comment.event.attendees.length > 0;
    const isGroupMember = (comment.event.group?.members?.length ?? 0) > 0;

    if (!isAttendee && !isGroupMember) {
      return {
        error: "You must be an event attendee or group member to react",
      };
    }

    // Check if reaction already exists
    const existingReaction = await prisma.commentReaction.findUnique({
      where: {
        commentId_userId_emoji: {
          commentId,
          userId: session.user.id,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // Remove reaction
      await prisma.commentReaction.delete({
        where: { id: existingReaction.id },
      });
      return { success: true, action: "removed" };
    } else {
      // Add reaction
      const reaction = await prisma.commentReaction.create({
        data: {
          commentId,
          userId: session.user.id,
          emoji,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nickname: true,
            },
          },
        },
      });

      // Send notification to comment author
      try {
        await notifyCommentReaction({
          commentUserId: comment.userId,
          reactorId: session.user.id,
          reactorName: reaction.user.nickname || reaction.user.firstName,
          eventId: comment.event.id,
          eventName: comment.event.name,
          commentId,
          emoji,
        });
      } catch (error) {
        console.error("Error sending reaction notification:", error);
      }

      return { success: true, action: "added", reaction };
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
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
