"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import {
  createEventSchema,
  CreateEventValues,
} from "@/validations/events/createEventSchema";
import { inviteToEventSchema } from "@/validations/events/inviteToEventSchema";
import { notifyEventCreated } from "@/lib/notification-triggers";
import { sendEventInviteEmail } from "@/utils/sendEmails";
import { generateToken } from "@/utils/tokens";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limiter";
import { notifyEventInvite } from "@/lib/notification-triggers";

function createEventDateTime(
  dateStr: string,
  timeStr: string,
  timezone: string
): Date {
  // Parse components
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  // Create a reference date to understand the timezone offset for this specific date/time
  const referenceDate = new Date(year, month - 1, day, 12, 0, 0); // Use noon as reference

  // Get the timezone offset for this date in the user's timezone (in minutes)
  const tempFormatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  });

  const timezoneName =
    tempFormatter
      .formatToParts(referenceDate)
      .find((part) => part.type === "timeZoneName")?.value || "+00:00";

  // Extract hours and minutes from timezone offset (e.g., "GMT-05:00" -> -5, 0)
  const offsetMatch = timezoneName.match(/GMT([+-])(\d{2}):(\d{2})/);
  let offsetHours = 0;
  let offsetMinutes = 0;

  if (offsetMatch) {
    const sign = offsetMatch[1] === "+" ? 1 : -1;
    offsetHours = sign * parseInt(offsetMatch[2]);
    offsetMinutes = sign * parseInt(offsetMatch[3]);
  }

  // Create the UTC date by subtracting the timezone offset
  // If user is in GMT+5, we subtract 5 hours from their local time to get UTC
  const utcDate = new Date(
    Date.UTC(year, month - 1, day, hour - offsetHours, minute - offsetMinutes)
  );

  return utcDate;
}

export async function createEventAction(values: CreateEventValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const validatedValues = createEventSchema.parse(values);
    const { date, name, description, groupId, location, time } =
      validatedValues;

    const timezone = session.user.timezone || "UTC";
    const eventDateTime = createEventDateTime(date, time, timezone);

    const event = await prisma.event.create({
      data: {
        name,
        description: description || null,
        location: location || null,
        date: eventDateTime,
        groupId: groupId || null,
        createdBy: session.user.id,
      },
    });

    // Create creator as confirmed attendee
    await prisma.eventAttendee.create({
      data: {
        userId: session.user.id,
        eventId: event.id,
        rsvpStatus: "yes", // Creator automatically says yes
        rsvpAt: new Date(),
      },
    });

    // Add group members as pending attendees
    if (groupId) {
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId },
        select: { userId: true },
      });

      const groupAttendees = groupMembers
        .filter((m) => m.userId !== session.user.id)
        .map((m) => ({
          userId: m.userId,
          eventId: event.id,
          rsvpStatus: "pending",
        }));

      if (groupAttendees.length > 0) {
        await prisma.eventAttendee.createMany({
          data: groupAttendees,
          skipDuplicates: true,
        });
      }

      // Send notifications to group members about new event
      try {
        const group = await prisma.group.findUnique({
          where: { id: groupId },
          select: { name: true },
        });

        if (group) {
          await notifyEventCreated({
            eventId: event.id,
            eventName: event.name,
            creatorName: session.user.firstName || session.user.email,
            groupId: groupId,
            groupName: group.name,
            groupMemberIds: groupMembers
              .filter((m) => m.userId !== session.user.id)
              .map((m) => m.userId),
          });
        }
      } catch (notificationError) {
        console.error(
          "Failed to send event creation notifications:",
          notificationError
        );
        // Don't fail event creation if notifications fail
      }
    }

    return { success: true, event };
  } catch (error) {
    console.error("Error creating event:", error);
    return { error: "An error occurred. Please try again." };
  }
}

export async function deleteEventAction(eventId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  });

  if (!event || event.createdBy !== session.user.id) {
    return { error: "You don't have permission to delete this event." };
  }

  await prisma.eventAttendee.deleteMany({
    where: { eventId },
  });

  await prisma.event.delete({
    where: { id: eventId },
  });

  return { success: true };
}

export async function editEventAction(
  eventId: string,
  values: CreateEventValues
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        createdBy: true,
        groupId: true,
      },
    });

    if (!existingEvent || existingEvent.createdBy !== session.user.id) {
      return { error: "You don't have permission to edit this event." };
    }

    const validatedValues = createEventSchema.parse(values);
    const { date, name, description, groupId, location, time } =
      validatedValues;

    const timezone = session.user.timezone || "UTC";
    const eventDateTime = createEventDateTime(date, time, timezone);

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        name,
        description: description || null,
        location: location || null,
        date: eventDateTime,
        groupId: groupId || null,
      },
    });

    if (existingEvent.groupId !== groupId) {
      await prisma.eventAttendee.deleteMany({
        where: {
          eventId,
          NOT: {
            userId: session.user.id,
          },
        },
      });

      if (groupId) {
        const newGroupMembers = await prisma.groupMember.findMany({
          where: { groupId },
          select: { userId: true },
        });

        await prisma.eventAttendee.createMany({
          data: [
            ...newGroupMembers
              .filter((m) => m.userId !== session.user.id)
              .map((m) => ({
                userId: m.userId,
                eventId,
              })),
          ],
          skipDuplicates: true,
        });
      }
    }

    return { success: true, event: updatedEvent };
  } catch (error) {
    console.error("Error editing event:", error);
    return { error: "An error occurred while editing the event." };
  }
}

export async function inviteToEventAction(eventId: string, email: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Rate limiting
  const limiter = rateLimit({ interval: 3600000 });
  try {
    await limiter.check(50, "email", session.user.id);
  } catch (error) {
    console.error("Rate limit error:", error);
    return { error: "Too many invite requests. Please try again later." };
  }

  if (!eventId || !email) {
    return { error: "Invalid input" };
  }

  // Validate email using Zod schema
  try {
    inviteToEventSchema.parse({ email });
  } catch (error) {
    console.error("Invalid email format:", error);
    return { error: "Invalid email format" };
  }

  try {
    // Check if event exists and user has permission
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        createdBy: session.user.id,
      },
    });

    if (!event) {
      return {
        error: "Event not found or you don't have permission to invite people",
      };
    }

    // Check if user with this email exists
    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      return { error: "No user with this email exists." };
    }

    // Check if user is already an attendee
    const existingAttendee = await prisma.eventAttendee.findFirst({
      where: {
        eventId,
        userId: invitedUser.id,
      },
    });

    if (existingAttendee) {
      return { error: "User is already invited to this event" };
    }

    // Check if there's already a pending invite
    const existingInvite = await prisma.eventInvite.findFirst({
      where: {
        eventId,
        email,
        status: "pending",
      },
    });

    if (existingInvite) {
      return { error: "An invitation has already been sent to this email" };
    }

    // Clean up any expired or old invitations for this event/email combination
    await prisma.eventInvite.deleteMany({
      where: {
        eventId,
        email,
        OR: [
          { status: { not: "pending" } },
          { expiresAt: { lt: new Date() } }
        ]
      }
    });

    // Generate invite token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invite
    const invite = await prisma.eventInvite.create({
      data: {
        eventId,
        email,
        invitedBy: session.user.id,
        token,
        expiresAt,
        status: "pending",
      },
    });

    // Send email
    try {
      await sendEventInviteEmail(
        email,
        session.user.firstName || session.user.email,
        event.name,
        event.date,
        event.location,
        token
      );
    } catch (emailError) {
      // If email fails, delete the invite and return error
      await prisma.eventInvite.delete({ where: { id: invite.id } });
      console.error("Failed to send invite email:", emailError);
      return { error: "Failed to send invitation email. Please try again." };
    }

    // Send in-app notification to invited user
    try {
      await notifyEventInvite({
        userId: invitedUser.id,
        eventId: event.id,
        eventName: event.name,
        inviterName: session.user.firstName || session.user.email,
        inviteId: token,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send event invite notification:",
        notificationError
      );
      // Don't fail the invite if notification fails
    }

    revalidatePath("/events");
    return { success: true, invite };
  } catch (error) {
    console.error("Event invite error:", error);

    // Handle Prisma unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { error: "An invitation has already been sent to this email for this event" };
    }

    return { error: "Failed to send invitation" };
  }
}

export async function leaveEventAction(eventId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    // Check if user is an attendee of this event
    const attendee = await prisma.eventAttendee.findFirst({
      where: {
        eventId,
        userId: session.user.id,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            createdBy: true,
          },
        },
      },
    });

    if (!attendee) {
      return { error: "You are not attending this event" };
    }

    // Don't allow event creator to leave their own event
    if (attendee.event.createdBy === session.user.id) {
      return { error: "You cannot leave an event you created. You can delete the event instead." };
    }

    // Remove user from event
    await prisma.eventAttendee.delete({
      where: {
        id: attendee.id,
      },
    });

    // Also mark any pending invites as declined
    await prisma.eventInvite.updateMany({
      where: {
        eventId,
        email: session.user.email,
        status: "pending",
      },
      data: {
        status: "declined",
      },
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `You have left "${attendee.event.name}"`,
      eventName: attendee.event.name
    };
  } catch (error) {
    console.error("Leave event error:", error);
    return { error: "Failed to leave event" };
  }
}

export async function acceptEventInviteAction(token: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    // Find the invite
    const invite = await prisma.eventInvite.findFirst({
      where: {
        token,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: {
        event: true,
        inviter: {
          select: { firstName: true, email: true },
        },
      },
    });

    if (!invite) {
      return { error: "Invalid or expired invitation" };
    }

    // Check if user is already an attendee
    const existingAttendee = await prisma.eventAttendee.findFirst({
      where: {
        eventId: invite.eventId,
        userId: session.user.id,
      },
    });

    if (existingAttendee) {
      // Mark invite as accepted even though user is already an attendee
      await prisma.eventInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });
      return { error: "You are already invited to this event" };
    }

    // Add user to event and mark invite as accepted
    await prisma.$transaction(async (tx) => {
      // Add user to event
      await tx.eventAttendee.create({
        data: {
          eventId: invite.eventId,
          userId: session.user.id,
          rsvpStatus: "pending",
        },
      });

      // Mark invite as accepted
      await tx.eventInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });

      // Delete the notification for this invitation
      await tx.notification.deleteMany({
        where: {
          userId: session.user.id,
          type: "EVENT_INVITE",
          data: {
            path: ["inviteId"],
            equals: token,
          },
        },
      });
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");
    return {
      success: true,
      event: invite.event,
      message: `Successfully joined "${invite.event.name}"!`
    };
  } catch (error) {
    console.error("Accept event invite error:", error);
    return { error: "Failed to accept invitation" };
  }
}
