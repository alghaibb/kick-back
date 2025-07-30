"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import {
  createCommentSchema,
  CreateCommentValues,
  replyCommentSchema,
  ReplyCommentValues,
  editCommentSchema,
  EditCommentValues,
  commentReactionSchema,
  CommentReactionValues,
} from "@/validations/events/createCommentSchema";
import { revalidatePath } from "next/cache";
import {
  notifyEventComment,
  notifyCommentReply,
  notifyCommentReaction,
} from "@/lib/notification-triggers";
import { del } from "@vercel/blob";

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

      // Check if this is a reply to a reply (contains @mention)
      const mentionMatch = content.match(/^@(\w+)\s/);
      if (mentionMatch) {
        const mentionedName = mentionMatch[1];

        // Find the mentioned user by finding a reply in this thread with that name
        const mentionedReply = await prisma.eventComment.findFirst({
          where: {
            eventId,
            OR: [
              { parentId: parentComment.parentId || parentComment.id }, // Same thread
              { id: parentComment.parentId || parentComment.id }, // Parent comment
            ],
            user: {
              OR: [{ nickname: mentionedName }, { firstName: mentionedName }],
            },
            userId: { not: session.user.id }, // Don't notify self
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                nickname: true,
              },
            },
          },
        });

        // Send additional notification to the mentioned user if found
        if (mentionedReply && mentionedReply.userId !== parentComment.userId) {
          await notifyCommentReply({
            parentCommentUserId: mentionedReply.userId,
            replierId: session.user.id,
            replierName: reply.user.nickname || reply.user.firstName,
            eventId,
            eventName: parentComment.event.name,
            commentId: reply.id,
          });
        }
      }
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
      console.error("Validation error:", validatedFields.error);
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

      // Send notification to comment author (background task)
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
        // Don't fail the reaction if notification fails
      }

      revalidatePath("/events");
      revalidatePath("/calendar");

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
      select: { userId: true, eventId: true, imageUrl: true },
    });

    if (!comment) {
      return { error: "Comment not found" };
    }

    if (comment.userId !== session.user.id) {
      return { error: "You can only delete your own comments" };
    }

    if (comment.imageUrl) {
      try {
        await del(comment.imageUrl);
      } catch (error) {
        console.error("Error deleting image blob:", error);
      }
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

export async function editCommentAction(values: EditCommentValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Validate comment fields
    const validatedFields = editCommentSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { commentId, content, imageUrl } = validatedFields.data;

    // Check if comment exists and user owns it
    const existingComment = await prisma.eventComment.findUnique({
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

    if (!existingComment) {
      return { error: "Comment not found" };
    }

    if (existingComment.userId !== session.user.id) {
      return { error: "You can only edit your own comments" };
    }

    // Check if user still has access to the event
    const isAttendee = existingComment.event.attendees.length > 0;
    const isGroupMember = (existingComment.event.group?.members?.length ?? 0) > 0;

    if (!isAttendee && !isGroupMember) {
      return { error: "You no longer have access to this event" };
    }

    // Update the comment
    const updatedComment = await prisma.eventComment.update({
      where: { id: commentId },
      data: {
        content,
        imageUrl,
        editedAt: new Date(), // Set the edited timestamp
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

    revalidatePath("/events");
    revalidatePath("/calendar");
    return { success: true, comment: updatedComment };
  } catch (error) {
    console.error("Error editing comment:", error);
    return { error: "An error occurred. Please try again." };
  }
}
