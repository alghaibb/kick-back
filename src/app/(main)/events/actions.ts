"use server";

import prisma from "@/lib/prisma";
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getSession } from "@/lib/sessions";
import {
  createEventSchema,
  CreateEventValues,
} from "@/validations/events/createEventSchema";
import { z } from "zod";
import {
  inviteToEventSchema,
  inviteToEventBatchSchema,
} from "@/validations/events/inviteToEventSchema";
import { notifyEventCreated } from "@/lib/notification-triggers";
import { sendEventInviteEmail } from "@/utils/sendEmails";
import { generateToken } from "@/utils/tokens";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limiter";
import { notifyEventInvite } from "@/lib/notification-triggers";
import {
  suggestLocationOptionSchema,
  voteLocationOptionSchema,
  closeLocationPollSchema,
  type SuggestLocationOptionValues,
  type VoteLocationOptionValues,
  type CloseLocationPollValues,
} from "@/validations/events/eventPollSchema";

function createEventDateTime(
  dateStr: string,
  timeStr: string,
  timezone: string
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const referenceDate = new Date(year, month - 1, day, 12, 0, 0); // Use noon as reference

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
    const { date, name, description, groupId, location, time, color } =
      validatedValues;

    const timezone = session.user.timezone || "UTC";
    const eventDateTime = createEventDateTime(date, time, timezone);

    const event = await prisma.event.create({
      data: {
        name,
        description: description || null,
        location: location || null,
        date: eventDateTime,
        color: color || "#3b82f6",
        groupId: groupId || null,
        createdBy: session.user.id,
      },
    });

    await prisma.eventAttendee.create({
      data: {
        userId: session.user.id,
        eventId: event.id,
        rsvpStatus: "yes", // Creator automatically says yes
        rsvpAt: new Date(),
      },
    });

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
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || "Invalid input";
      return { error: message };
    }
    const err = error as unknown as { message?: string } & (
      | PrismaClientKnownRequestError
      | Record<string, unknown>
    );
    if ((err as PrismaClientKnownRequestError)?.code) {
      return { error: err.message || "Database error" };
    }
    return { error: err?.message || "An error occurred. Please try again." };
  }
}

function buildDedupeKey(
  addressFormatted: string,
  latitude?: number,
  longitude?: number
): string {
  if (typeof latitude === "number" && typeof longitude === "number") {
    const lat = latitude.toFixed(4);
    const lng = longitude.toFixed(4);
    return `${lat}|${lng}`;
  }
  const normalized = addressFormatted
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized;
}

export async function suggestLocationOptionAction(
  values: SuggestLocationOptionValues
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" } as const;
    }

    const { eventId, label, addressFormatted, latitude, longitude } =
      suggestLocationOptionSchema.parse(values);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        attendees: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    if (!event) {
      return { error: "Event not found" } as const;
    }

    if (event.location) {
      return { error: "Location already set for this event" } as const;
    }

    const isHost = event.createdBy === session.user.id;
    const isAttendee = event.attendees.length > 0;
    if (!isHost && !isAttendee) {
      return { error: "Access denied" } as const;
    }

    const dedupeKey = buildDedupeKey(addressFormatted, latitude, longitude);

    const result = await prisma.$transaction(async (tx) => {
      let poll = await tx.eventPoll.findFirst({
        where: { eventId, status: "open" },
        select: { id: true },
      });

      if (!poll) {
        poll = await tx.eventPoll.create({
          data: {
            eventId,
            status: "open",
            createdBy: session.user.id,
          },
          select: { id: true },
        });
      }

      // Upsert option by dedupeKey
      let option = await tx.eventPollOption.findFirst({
        where: { pollId: poll.id, dedupeKey },
        select: { id: true },
      });

      if (!option) {
        option = await tx.eventPollOption.create({
          data: {
            pollId: poll.id,
            label,
            addressFormatted,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            dedupeKey,
            suggestedBy: session.user.id,
          },
          select: { id: true },
        });
      }

      // Upsert vote (one per user per poll)
      const existingVote = await tx.eventPollVote.findFirst({
        where: { pollId: poll.id, userId: session.user.id },
        select: { id: true },
      });

      if (existingVote) {
        await tx.eventPollVote.update({
          where: { id: existingVote.id },
          data: { optionId: option.id },
        });
      } else {
        await tx.eventPollVote.create({
          data: {
            pollId: poll.id,
            optionId: option.id,
            userId: session.user.id,
          },
        });
      }

      return { pollId: poll.id, optionId: option.id };
    });

    return { success: true, ...result } as const;
  } catch (error) {
    console.error("Suggest location option error:", error);
    return { error: "Failed to suggest location" } as const;
  }
}

export async function voteLocationOptionAction(
  values: VoteLocationOptionValues
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" } as const;
    }

    const { eventId, optionId } = voteLocationOptionSchema.parse(values);

    const poll = await prisma.eventPoll.findFirst({
      where: { eventId, status: "open" },
      select: { id: true },
    });
    if (!poll) {
      return { error: "No open poll" } as const;
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        attendees: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });
    if (!event) return { error: "Event not found" } as const;
    const isHost = event.createdBy === session.user.id;
    const isAttendee = event.attendees.length > 0;
    if (!isHost && !isAttendee) return { error: "Access denied" } as const;

    const existingVote = await prisma.eventPollVote.findFirst({
      where: { pollId: poll.id, userId: session.user.id },
      select: { id: true },
    });

    if (existingVote) {
      await prisma.eventPollVote.update({
        where: { id: existingVote.id },
        data: { optionId, voteType: "yes" },
      });
    } else {
      await prisma.eventPollVote.create({
        data: {
          pollId: poll.id,
          optionId,
          userId: session.user.id,
          voteType: "yes",
        },
      });
    }

    return { success: true } as const;
  } catch (error) {
    console.error("Vote location option error:", error);
    return { error: "Failed to vote" } as const;
  }
}

export async function closeLocationPollAction(values: CloseLocationPollValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" } as const;
    }

    const { eventId, winningOptionId } = closeLocationPollSchema.parse(values);

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { error: "Event not found" } as const;
    if (event.createdBy !== session.user.id) {
      return { error: "Only host can close the poll" } as const;
    }

    const poll = await prisma.eventPoll.findFirst({
      where: { eventId, status: "open" },
      select: { id: true },
    });
    if (!poll) return { error: "No open poll" } as const;

    await prisma.$transaction(async (tx) => {
      // If winning not provided, pick the highest-voted
      let chosenOptionId = winningOptionId;
      if (!chosenOptionId) {
        const top = await tx.eventPollOption.findFirst({
          where: { pollId: poll!.id },
          orderBy: [{ votes: { _count: "desc" } }, { createdAt: "asc" }],
          select: { id: true },
        });
        chosenOptionId = top?.id;
      }

      if (chosenOptionId) {
        const option = await tx.eventPollOption.findUnique({
          where: { id: chosenOptionId },
          select: {
            addressFormatted: true,
            latitude: true,
            longitude: true,
          },
        });
        if (option) {
          await tx.event.update({
            where: { id: eventId },
            data: {
              location: option.addressFormatted,
              latitude: option.latitude ?? null,
              longitude: option.longitude ?? null,
            },
          });
        }
      }

      await tx.eventPoll.update({
        where: { id: poll.id },
        data: { status: "closed", closedAt: new Date() },
      });
    });

    revalidatePath("/events");
    revalidatePath("/calendar");
    return { success: true } as const;
  } catch (error) {
    console.error("Close location poll error:", error);
    return { error: "Failed to close poll" } as const;
  }
}

export async function voteNoLocationOptionAction(
  values: VoteLocationOptionValues
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" } as const;
    }

    const { eventId, optionId } = voteLocationOptionSchema.parse(values);

    const poll = await prisma.eventPoll.findFirst({
      where: { eventId, status: "open" },
      select: { id: true },
    });
    if (!poll) return { error: "No open poll" } as const;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        attendees: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });
    if (!event) return { error: "Event not found" } as const;
    const isHost = event.createdBy === session.user.id;
    const isAttendee = event.attendees.length > 0;
    if (!isHost && !isAttendee) return { error: "Access denied" } as const;

    await prisma.eventPollVote.upsert({
      where: {
        optionId_userId: { optionId, userId: session.user.id },
      },
      update: { optionId, voteType: "no" },
      create: {
        pollId: poll.id,
        optionId,
        userId: session.user.id,
        voteType: "no",
      },
    });

    return { success: true } as const;
  } catch (error) {
    console.error("Vote NO option error:", error);
    return { error: "Failed to vote no" } as const;
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
    const { date, name, description, groupId, location, time, color } =
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
        color: color || "#3b82f6",
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

export async function moveEventToDateAction(
  eventId: string,
  newDateISO: string
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdBy: true, date: true },
    });

    if (!event || event.createdBy !== session.user.id) {
      return { error: "You don't have permission to move this event." };
    }

    const existingDate = event.date;
    const newDate = new Date(newDateISO);
    if (isNaN(newDate.getTime())) {
      return { error: "Invalid date" };
    }

    // Preserve the original time (hours/minutes) while changing day
    const preserved = new Date(newDate);
    preserved.setHours(existingDate.getHours());
    preserved.setMinutes(existingDate.getMinutes());
    preserved.setSeconds(0, 0);

    await prisma.event.update({
      where: { id: eventId },
      data: { date: preserved },
    });

    revalidatePath("/calendar");
    revalidatePath("/events");

    return { success: true };
  } catch (error) {
    console.error("Move event to date error:", error);
    return { error: "Failed to move event" };
  }
}

export async function inviteToEventAction(
  eventId: string,
  email: string,
  skipRateLimit: boolean = false
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  if (!skipRateLimit) {
    const limiter = rateLimit({ interval: 3600000 });
    try {
      await limiter.check(50, "email", `event-invite:${session.user.id}`);
    } catch (error) {
      console.error("Rate limit error:", error);
      return { error: "Too many invite requests. Please try again later." };
    }
  }

  if (!eventId || !email) {
    return { error: "Invalid input" };
  }

  try {
    inviteToEventSchema.parse({ email });
  } catch (error) {
    console.error("Invalid email format:", error);
    return { error: "Invalid email format" };
  }

  try {
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

    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      return { error: "No user with this email exists." };
    }

    const existingAttendee = await prisma.eventAttendee.findFirst({
      where: {
        eventId,
        userId: invitedUser.id,
      },
    });

    if (existingAttendee) {
      return { error: "User is already invited to this event" };
    }

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

    await prisma.eventInvite.deleteMany({
      where: {
        eventId,
        email,
        OR: [{ status: { not: "pending" } }, { expiresAt: { lt: new Date() } }],
      },
    });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        error:
          "An invitation has already been sent to this email for this event",
      };
    }

    return { error: "Failed to send invitation" };
  }
}

export async function inviteToEventBatchAction(
  eventId: string,
  emails: string[]
) {
  try {
    const parsed = inviteToEventBatchSchema.parse({ eventId, emails });
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }
    const limiter = rateLimit({ interval: 3600000 });
    try {
      await limiter.check(50, "email", `event-invite:${session.user.id}`);
    } catch (error) {
      console.error("Rate limit error:", error);
      return { error: "Too many invite requests. Please try again later." };
    }
    const results = await Promise.allSettled(
      parsed.emails.map(async (email) => {
        const res = await inviteToEventAction(parsed.eventId, email, true);
        if (res?.error) {
          return { email, ok: false, error: res.error } as const;
        }
        return { email, ok: true } as const;
      })
    );

    const succeeded: string[] = [];
    const failed: { email: string; error: string }[] = [];
    results.forEach((r) => {
      if (r.status === "fulfilled") {
        if (r.value.ok) succeeded.push(r.value.email);
        else failed.push({ email: r.value.email, error: r.value.error });
      }
    });

    return { success: true, succeeded, failed };
  } catch (error) {
    console.error("Batch event invite error:", error);
    return { error: "Failed to send some invitations" };
  }
}

export async function leaveEventAction(eventId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
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
      return {
        error:
          "You cannot leave an event you created. You can delete the event instead.",
      };
    }

    await prisma.eventAttendee.delete({
      where: {
        id: attendee.id,
      },
    });

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
      eventName: attendee.event.name,
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

    await prisma.$transaction(async (tx) => {
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
      message: `Successfully joined "${invite.event.name}"!`,
    };
  } catch (error) {
    console.error("Accept event invite error:", error);
    return { error: "Failed to accept invitation" };
  }
}
