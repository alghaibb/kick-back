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
import { RRule, Frequency, Options as RRuleOptions } from "rrule";
import { addMonths } from "date-fns";
import { createReccuringEventSchema } from "@/validations/events/createReccuringEventSchema";
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

// Type for recurring event values combining base event and recurrence
type CreateRecurringEventValues = CreateEventValues & {
  recurrence?: z.infer<typeof createReccuringEventSchema>;
};

export async function createRecurringEventAction(
  values: CreateRecurringEventValues
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Validate base event fields
    const { recurrence, ...baseEventValues } = values;
    const eventValidation = createEventSchema.safeParse(baseEventValues);
    if (!eventValidation.success) {
      return { error: "Invalid event fields" };
    }

    // Validate recurrence fields if provided
    let validatedRecurrence = recurrence;
    if (recurrence) {
      const recurrenceValidation =
        createReccuringEventSchema.safeParse(recurrence);
      if (!recurrenceValidation.success) {
        return { error: "Invalid recurrence fields" };
      }
      validatedRecurrence = recurrenceValidation.data;
    }

    const eventData = eventValidation.data;
    const timezone = session.user.timezone || "UTC";

    // If recurrence is not enabled, create a single event
    if (!validatedRecurrence?.enabled) {
      return createEventAction(eventData);
    }

    // Parse the date and time to create a local datetime
    const [year, month, day] = eventData.date.split("-").map(Number);
    const [hour, minute] = eventData.time.split(":").map(Number);

    // Create a date in the user's local time (not UTC)
    // This ensures RRule generates occurrences at the same local time
    const localStartDate = new Date(year, month - 1, day, hour, minute, 0);

    // Generate recurrence rule
    const frequencyMap: Record<string, Frequency> = {
      daily: RRule.DAILY,
      weekly: RRule.WEEKLY,
      monthly: RRule.MONTHLY,
    };

    const rruleOptions: Partial<RRuleOptions> = {
      freq: frequencyMap[validatedRecurrence.frequency],
      interval: validatedRecurrence.interval || 1,
      dtstart: localStartDate,
    };

    // Add end condition
    if (
      validatedRecurrence.endType === "after" &&
      validatedRecurrence.endAfter
    ) {
      rruleOptions.count = validatedRecurrence.endAfter;
    } else if (
      validatedRecurrence.endType === "on" &&
      validatedRecurrence.endDate
    ) {
      rruleOptions.until = new Date(validatedRecurrence.endDate);
    }

    // Add weekdays for weekly recurrence
    if (
      validatedRecurrence.frequency === "weekly" &&
      validatedRecurrence.weekDays
    ) {
      rruleOptions.byweekday = validatedRecurrence.weekDays.map(
        (day: number) => {
          return day === 0 ? 6 : day - 1;
        }
      );
    }

    const rrule = new RRule(rruleOptions);
    const rruleString = rrule.toString();

    const threeMonthsFromNow = addMonths(new Date(), 3);
    const maxDate = new Date(
      threeMonthsFromNow.getFullYear(),
      threeMonthsFromNow.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    const occurrences = rrule.between(localStartDate, maxDate, true);

    // Limit to max 52 occurrences for safety
    const limitedOccurrences = occurrences.slice(0, 52);

    // Generate a unique recurrence ID for this series
    const recurrenceId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create all events in a transaction
    const events = await prisma.$transaction(async (tx) => {
      type CreatedEvent = Awaited<ReturnType<typeof tx.event.create>>;
      const createdEvents: CreatedEvent[] = [];

      for (let i = 0; i < limitedOccurrences.length; i++) {
        const occurrence = limitedOccurrences[i];

        // Extract the date from the occurrence
        const occurrenceDate = new Date(occurrence);
        const year = occurrenceDate.getFullYear();
        const month = occurrenceDate.getMonth() + 1;
        const day = occurrenceDate.getDate();
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        // Always use the same time from the template, adjusted for the specific date's timezone
        const eventDateTimeUTC = createEventDateTime(
          dateStr,
          eventData.time,
          timezone
        );

        const createdEvent = await tx.event.create({
          data: {
            name: eventData.name,
            description: eventData.description,
            date: eventDateTimeUTC,
            location: eventData.location,
            color: eventData.color,
            groupId: eventData.groupId,
            createdBy: session.user.id,
            isRecurring: true,
            recurrenceId,
            recurrenceRule: i === 0 ? rruleString : null,
            recurrenceEndDate:
              validatedRecurrence.endType === "on" &&
              validatedRecurrence.endDate
                ? new Date(validatedRecurrence.endDate)
                : null,
            parentEventId: i === 0 ? null : createdEvents[0]?.id, // First event is parent
            attendees: {
              create: {
                userId: session.user.id,
                rsvpStatus: "yes",
                rsvpAt: new Date(),
              },
            },
          },
          include: {
            group: true,
            attendees: {
              include: {
                user: true,
              },
            },
          },
        });

        createdEvents.push(createdEvent);
      }

      return createdEvents;
    });

    // Notify about the first event only
    if (events[0] && eventData.groupId) {
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId: eventData.groupId },
        select: { userId: true },
      });

      const group = await prisma.group.findUnique({
        where: { id: eventData.groupId },
        select: { name: true },
      });

      if (group) {
        await notifyEventCreated({
          eventId: events[0].id,
          eventName: events[0].name,
          creatorName: session.user.firstName || session.user.email,
          groupId: eventData.groupId,
          groupName: group.name,
          groupMemberIds: groupMembers
            .filter((m) => m.userId !== session.user.id)
            .map((m) => m.userId),
        });
      }
    }

    revalidatePath("/events");
    revalidatePath("/calendar");

    return {
      success: true,
      eventId: events[0]?.id,
      count: events.length,
      message: `Created ${events.length} recurring events`,
    };
  } catch (error) {
    console.error("Create recurring event error:", error);
    return { error: "Failed to create recurring events" };
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

export async function deleteEventAction(
  eventId: string,
  deleteAllInSeries = false
) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      createdBy: true,
      isRecurring: true,
      recurrenceId: true,
    },
  });

  if (!event || event.createdBy !== session.user.id) {
    return { error: "You don't have permission to delete this event." };
  }

  // If deleting all in series and this is a recurring event
  if (deleteAllInSeries && event.isRecurring && event.recurrenceId) {
    // Delete all events in the series
    const eventsToDelete = await prisma.event.findMany({
      where: {
        recurrenceId: event.recurrenceId,
        createdBy: session.user.id,
      },
      select: { id: true },
    });

    const eventIds = eventsToDelete.map((e) => e.id);

    // Delete all attendees for all events in the series
    await prisma.eventAttendee.deleteMany({
      where: { eventId: { in: eventIds } },
    });

    // Delete all events in the series
    await prisma.event.deleteMany({
      where: { id: { in: eventIds } },
    });

    return { success: true, deletedCount: eventIds.length };
  }

  // Delete single event (or non-recurring event)
  await prisma.eventAttendee.deleteMany({
    where: { eventId },
  });

  await prisma.event.delete({
    where: { id: eventId },
  });

  return { success: true, deletedCount: 1 };
}

export async function editEventAction(
  eventId: string,
  values: CreateEventValues,
  editAllInSeries = false
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
        isRecurring: true,
        recurrenceId: true,
        date: true,
        recurrenceEndDate: true,
        parentEventId: true,
        id: true,
      },
    });

    if (!existingEvent || existingEvent.createdBy !== session.user.id) {
      return { error: "You don't have permission to edit this event." };
    }

    const validatedValues = createEventSchema.parse(values);
    const { date, name, description, groupId, location, time, color } =
      validatedValues;

    const timezone = session.user.timezone || "UTC";

    // If editing all in series and this is a recurring event
    if (
      editAllInSeries &&
      existingEvent.isRecurring &&
      existingEvent.recurrenceId
    ) {
      // Get ALL events in the series (not just future ones)
      const eventsToUpdate = await prisma.event.findMany({
        where: {
          recurrenceId: existingEvent.recurrenceId,
          createdBy: session.user.id,
        },
        orderBy: { date: "asc" },
      });

      console.log("=== EVENTS TO UPDATE ===");
      eventsToUpdate.forEach((event, index) => {
        console.log(
          `${index + 1}. ${new Date(event.date).toISOString()} - ${event.name}`
        );
      });

      // Parse the form date and time
      const formDate = new Date(date + "T" + time);
      const originalEventDate = new Date(existingEvent.date);

      // Determine if user changed the date or just the time
      const formDateOnly = new Date(formDate);
      formDateOnly.setHours(0, 0, 0, 0);
      const originalDateOnly = new Date(originalEventDate);
      originalDateOnly.setHours(0, 0, 0, 0);

      const dateChanged = formDateOnly.getTime() !== originalDateOnly.getTime();

      // Update all events in the series
      const updatedEvents = await prisma.$transaction(async (tx) => {
        const results = [];

        if (dateChanged) {
          // User changed the date - we need to regenerate the entire series
          // to ensure we don't miss any valid dates

          // Find the earliest event in the series to use as our new start point
          const earliestEvent = eventsToUpdate[0];
          const earliestDate = new Date(earliestEvent.date);

          // Calculate the new start date by applying the day shift to the earliest event
          const originalDayOfWeek = originalEventDate.getDay();
          const formDayOfWeek = formDate.getDay();
          const dayDifference = formDayOfWeek - originalDayOfWeek;

          const newStartDate = new Date(earliestDate);
          newStartDate.setDate(earliestDate.getDate() + dayDifference);

          // Regenerate the series based on the original RRULE pattern but with new day
          // For now, let's update existing events and check if we need to create additional ones

          // First, update all existing events with the day shift
          for (const event of eventsToUpdate) {
            const eventDate = new Date(event.date);
            const shiftedDate = new Date(eventDate);
            shiftedDate.setDate(eventDate.getDate() + dayDifference);

            const year = shiftedDate.getFullYear();
            const month = shiftedDate.getMonth() + 1;
            const day = shiftedDate.getDate();
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const eventDateTime = createEventDateTime(dateStr, time, timezone);

            const updated = await tx.event.update({
              where: { id: event.id },
              data: {
                name,
                description: description || null,
                location: location || null,
                date: eventDateTime,
                color: color || "#3b82f6",
                groupId: groupId || null,
              },
            });
            results.push(updated);
          }

          // Check if we need to create additional events
          // Find the last updated event and see if there are more valid dates
          const lastEvent = eventsToUpdate[eventsToUpdate.length - 1];
          const lastDate = new Date(lastEvent.date);
          const shiftedLastDate = new Date(lastDate);
          shiftedLastDate.setDate(lastDate.getDate() + dayDifference);

          // Only create additional events for dates that would have existed in the original pattern
          // For recurring events with no end date, we want to maintain the same frequency pattern

          let maxAdditionalEvents = 0;

          if (existingEvent.recurrenceEndDate) {
            // If there's an explicit end date, check if we need to extend within that range
            const originalEndDate = new Date(existingEvent.recurrenceEndDate);
            const shiftedEndDate = new Date(originalEndDate);
            shiftedEndDate.setDate(originalEndDate.getDate() + dayDifference);

            // Check if the shifted last date is before the shifted end date
            if (shiftedLastDate < shiftedEndDate) {
              // Calculate how many more events we might need (up to 4 more to be safe)
              maxAdditionalEvents = 4;
            }
          } else {
            // For "never" recurring, only add a few more events to maintain the pattern
            maxAdditionalEvents = 4;
          }

          // Create additional events only for the next few occurrences in the pattern
          if (maxAdditionalEvents > 0) {
            // Find the last Thursday in the original pattern BEFORE any updates
            // We need to use the original event that triggered this action
            const lastOriginalDate = new Date(existingEvent.date);

            // Calculate the next Thursday after the current event
            let nextThursday = new Date(lastOriginalDate);
            nextThursday.setDate(nextThursday.getDate() + 7); // Next Thursday

            let eventsCreated = 0;

            while (eventsCreated < maxAdditionalEvents) {
              // Calculate the corresponding Wednesday for this Thursday
              const correspondingWednesday = new Date(nextThursday);
              correspondingWednesday.setDate(
                nextThursday.getDate() + dayDifference
              );

              // Check if we already have an event on this Wednesday
              const existingEventOnDate = eventsToUpdate.find((event) => {
                const eventDate = new Date(event.date);
                return (
                  eventDate.toDateString() ===
                  correspondingWednesday.toDateString()
                );
              });

              // If no event exists on this Wednesday, create one
              if (!existingEventOnDate) {
                // Check if we're still within the valid range
                let withinRange = true;
                if (existingEvent.recurrenceEndDate) {
                  const originalEndDate = new Date(
                    existingEvent.recurrenceEndDate
                  );
                  withinRange = nextThursday <= originalEndDate;
                }

                if (withinRange) {
                  const year = correspondingWednesday.getFullYear();
                  const month = correspondingWednesday.getMonth() + 1;
                  const day = correspondingWednesday.getDate();
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const eventDateTime = createEventDateTime(
                    dateStr,
                    time,
                    timezone
                  );

                  const newEvent = await tx.event.create({
                    data: {
                      name,
                      description: description || null,
                      location: location || null,
                      date: eventDateTime,
                      color: color || "#3b82f6",
                      groupId: groupId || null,
                      createdBy: session.user.id,
                      isRecurring: true,
                      recurrenceId: existingEvent.recurrenceId!,
                      recurrenceRule: null, // Not the first event
                      recurrenceEndDate: existingEvent.recurrenceEndDate,
                      parentEventId:
                        existingEvent.parentEventId || existingEvent.id,
                    },
                  });
                  results.push(newEvent);
                  eventsCreated++;
                } else {
                  break; // Stop if we're past the end date
                }
              }

              nextThursday.setDate(nextThursday.getDate() + 7); // Next Thursday

              // Safety check: don't go more than 6 months ahead
              const sixMonthsFromNow = new Date(lastOriginalDate);
              sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
              if (nextThursday > sixMonthsFromNow) break;
            }
          }
        } else {
          // User only changed the time - keep the original dates
          for (const event of eventsToUpdate) {
            const eventDate = new Date(event.date);
            const year = eventDate.getFullYear();
            const month = eventDate.getMonth() + 1;
            const day = eventDate.getDate();
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const eventDateTime = createEventDateTime(dateStr, time, timezone);

            const updated = await tx.event.update({
              where: { id: event.id },
              data: {
                name,
                description: description || null,
                location: location || null,
                date: eventDateTime,
                color: color || "#3b82f6",
                groupId: groupId || null,
              },
            });
            results.push(updated);
          }
        }

        return results;
      });

      return { success: true, updatedCount: updatedEvents.length };
    }

    // Single event edit (original code)
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

export async function deleteSingleOccurrenceAction(eventId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        createdBy: true,
        isRecurring: true,
        recurrenceId: true,
        date: true,
        name: true,
        recurrenceEndDate: true,
        parentEventId: true,
        id: true,
      },
    });

    if (!existingEvent || existingEvent.createdBy !== session.user.id) {
      return { error: "You don't have permission to delete this event." };
    }

    if (!existingEvent.isRecurring || !existingEvent.recurrenceId) {
      return { error: "This is not a recurring event." };
    }

    // Create an exception to mark this occurrence as cancelled
    await prisma.recurrenceException.create({
      data: {
        eventId,
        recurrenceId: existingEvent.recurrenceId!,
        originalDate: existingEvent.date,
        isCancelled: true,
        modifiedEventId: null,
      },
    });

    revalidatePath("/events");
    revalidatePath("/calendar");
    return { success: true, message: "Single occurrence deleted successfully" };
  } catch (error) {
    console.error("Error deleting single occurrence:", error);
    return { error: "Failed to delete single occurrence" };
  }
}

export async function editSingleOccurrenceAction(
  eventId: string,
  values: CreateEventValues
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        createdBy: true,
        isRecurring: true,
        recurrenceId: true,
        date: true,
        name: true,
        description: true,
        location: true,
        color: true,
        groupId: true,
        recurrenceEndDate: true,
        parentEventId: true,
        id: true,
      },
    });

    if (!existingEvent || existingEvent.createdBy !== session.user.id) {
      return { error: "You don't have permission to edit this event." };
    }

    if (!existingEvent.isRecurring || !existingEvent.recurrenceId) {
      return { error: "This is not a recurring event." };
    }

    const validatedValues = createEventSchema.parse(values);
    const timezone = session.user.timezone || "UTC";
    const eventDateTime = createEventDateTime(
      validatedValues.date,
      validatedValues.time,
      timezone
    );

    // Create an exception for this occurrence
    await prisma.$transaction(async (tx) => {
      // Create exception record
      await tx.recurrenceException.create({
        data: {
          eventId,
          recurrenceId: existingEvent.recurrenceId!, // Already checked above
          originalDate: existingEvent.date,
          isCancelled: false,
          modifiedEventId: null,
        },
      });

      // Update the existing event with new values (this detaches it from the series)
      const updatedEvent = await tx.event.update({
        where: { id: eventId },
        data: {
          name: validatedValues.name,
          description: validatedValues.description || null,
          location: validatedValues.location || null,
          date: eventDateTime,
          color: validatedValues.color || "#3b82f6",
          groupId: validatedValues.groupId || null,
          // Keep the recurrence fields but mark as modified
        },
      });

      // Ensure the creator is an attendee (in case they weren't before)
      await tx.eventAttendee.upsert({
        where: {
          eventId_userId: {
            eventId,
            userId: session.user.id,
          },
        },
        update: {
          rsvpStatus: "yes", // Creator automatically says yes
          rsvpAt: new Date(),
        },
        create: {
          eventId,
          userId: session.user.id,
          rsvpStatus: "yes", // Creator automatically says yes
          rsvpAt: new Date(),
        },
      });

      // Update the exception with the modified event ID (for tracking)
      await tx.recurrenceException.updateMany({
        where: {
          eventId,
          recurrenceId: existingEvent.recurrenceId!, // Already checked above
          originalDate: existingEvent.date,
        },
        data: {
          modifiedEventId: eventId,
        },
      });

      return updatedEvent;
    });

    revalidatePath("/events");
    revalidatePath("/calendar");
    return { success: true, message: "Single occurrence updated successfully" };
  } catch (error) {
    console.error("Error editing single occurrence:", error);
    return { error: "Failed to edit single occurrence" };
  }
}

export async function reenableEventAction(eventId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Check if the user can re-enable this event (creator or attendee)
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        createdBy: true,
        recurrenceId: true,
        isRecurring: true,
        attendees: {
          where: { userId: session.user.id },
          select: { userId: true },
        },
      },
    });

    if (!existingEvent) {
      return { error: "Event not found" };
    }

    if (
      existingEvent.createdBy !== session.user.id &&
      !existingEvent.attendees.some(
        (attendee) => attendee.userId === session.user.id
      )
    ) {
      return { error: "You don't have permission to re-enable this event" };
    }

    if (!existingEvent.isRecurring) {
      return { error: "Only recurring events can be cancelled and re-enabled" };
    }

    // Find and remove the RecurrenceException that marks this event as cancelled
    const cancelledException = await prisma.recurrenceException.findFirst({
      where: {
        eventId: eventId,
        isCancelled: true,
      },
    });

    if (!cancelledException) {
      return { error: "Event is not cancelled" };
    }

    // Remove the cancellation by deleting the RecurrenceException
    await prisma.recurrenceException.delete({
      where: { id: cancelledException.id },
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error re-enabling event:", error);
    return { error: "Failed to re-enable event" };
  }
}

"use server";

import { getSession } from "@/lib/sessions";

export async function cancelEventAction(eventId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Check if the user can cancel this event (creator only)
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        createdBy: true,
        isRecurring: true,
        isCancelled: true,
      },
    });

    if (!existingEvent) {
      return { error: "Event not found" };
    }

    if (existingEvent.createdBy !== session.user.id) {
      return { error: "You don't have permission to cancel this event" };
    }

    if (existingEvent.isRecurring) {
      return { error: "Use cancel single occurrence for recurring events" };
    }

    if (existingEvent.isCancelled) {
      return { error: "Event is already cancelled" };
    }

    // Mark the event as cancelled
    await prisma.event.update({
      where: { id: eventId },
      data: {
        isCancelled: true,
        cancelledAt: new Date(),
      },
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error cancelling event:", error);
    return { error: "Failed to cancel event" };
  }
}
