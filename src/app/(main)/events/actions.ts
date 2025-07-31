"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import {
  createEventSchema,
  CreateEventValues,
} from "@/validations/events/createEventSchema";
import { notifyEventCreated } from "@/lib/notification-triggers";
function createEventDateTime(
  dateStr: string,
  timeStr: string,
  timezone: string
): Date {
  // Create datetime string in ISO format
  const dateTimeString = `${dateStr}T${timeStr}:00`;

  // Create a date that represents the input time in the user's timezone
  // We'll use the opposite approach: create what we want the final time to be
  // in the user's timezone, then find what UTC time that corresponds to

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

  console.log("✅ DEBUG createEventDateTime:", {
    input: { dateStr, timeStr, timezone },
    dateTimeString,
    timezoneName,
    offsetHours,
    offsetMinutes,
    utcDate: utcDate.toISOString(),
    verifyUserTime: utcDate.toLocaleString("en-US", { timeZone: timezone }),
  });

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

    // Return debug info for client-side logging (temporary)
    console.log("Event created with date:", {
      originalInput: { date, time },
      processedDateTime: eventDateTime.toISOString(),
      savedDate: event.date.toISOString(),
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
