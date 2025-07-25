"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { createEventSchema, CreateEventValues } from "@/validations/events/createEventSchema";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";

function createEventDateTime(dateStr: string, time: string, timezone: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const localDateTime = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

  const utcDate = zonedTimeToUtc(localDateTime, timezone);

  console.log("createEventDateTime debug:", {
    input: { dateStr, time, timezone },
    localDateTime,
    utcDate: utcDate.toISOString(),
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
    const { date, name, description, groupId, location, time } = validatedValues;
    
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
      }
    });

    // Return debug info for client-side logging (temporary)
    console.log('Event created with date:', {
      originalInput: { date, time },
      processedDateTime: eventDateTime.toISOString(),
      savedDate: event.date.toISOString()
    });

    // Create creator as confirmed attendee
    await prisma.eventAttendee.create({
      data: {
        userId: session.user.id,
        eventId: event.id,
        rsvpStatus: "yes", // Creator automatically says yes
        rsvpAt: new Date()
      }
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
    }


    return { success: true, event };
  } catch (error) {
    console.error("Error creating event:", error)
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

export async function editEventAction(eventId: string, values: CreateEventValues) {
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
    const { date, name, description, groupId, location, time } = validatedValues;

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