"use server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { createEventSchema, CreateEventValues } from "@/validations/events/createEventSchema";
import { fromZonedTime } from "date-fns-tz";
import { revalidatePath } from "next/cache";

export async function createEventAction(values: CreateEventValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const validatedValues = createEventSchema.parse(values);
    const { date, name, description, groupId, location, time } = validatedValues;

    // Parse the time input (HH:mm format)
    const [hours, minutes] = time.split(":").map(Number);

    // Get user's timezone from session
    const userTimezone = session.user.timezone || 'UTC';

    // Create date/time combination in the user's timezone
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Create a date object representing the local time in the user's timezone
    const localDateTime = new Date(year, month, day, hours, minutes, 0, 0);

    // Convert from user's timezone to UTC for database storage
    const eventDateTime = fromZonedTime(localDateTime, userTimezone);

    console.log(`Creating event: ${name}`);
    console.log(`Selected date from calendar: ${date.toISOString()}`);
    console.log(`Selected time: ${time}`);
    console.log(`User timezone: ${userTimezone}`);
    console.log(`Local date/time: ${localDateTime.toString()}`);
    console.log(`Final event date/time (UTC): ${eventDateTime.toISOString()}`);
    console.log(`Timezone offset: ${localDateTime.getTimezoneOffset()} minutes`);

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

    if (groupId) {
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId },
        select: { userId: true },
      });

      await prisma.eventAttendee.createMany({
        data: [
          ...groupMembers
            .filter((m) => m.userId !== session.user.id)
            .map((m) => ({
              userId: m.userId,
              eventId: event.id,
            })),
          { userId: session.user.id, eventId: event.id },
        ],
        skipDuplicates: true,
      });

    }


    revalidatePath("/events")

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

  revalidatePath("/events");

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

    // Parse the time input (HH:mm format)
    const [hours, minutes] = time.split(":").map(Number);

    // Get user's timezone from session
    const userTimezone = session.user.timezone || 'UTC';

    // Create date/time combination in the user's timezone
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Create a date object representing the local time in the user's timezone
    const localDateTime = new Date(year, month, day, hours, minutes, 0, 0);

    // Convert from user's timezone to UTC for database storage
    const eventDateTime = fromZonedTime(localDateTime, userTimezone);

    console.log(`Editing event: ${name}`);
    console.log(`Selected date from calendar: ${date.toISOString()}`);
    console.log(`Selected time: ${time}`);
    console.log(`User timezone: ${userTimezone}`);
    console.log(`Local date/time: ${localDateTime.toString()}`);
    console.log(`Final event date/time (UTC): ${eventDateTime.toISOString()}`);

    // Update the event fields
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

    // Update attendees only if groupId changed
    if (existingEvent.groupId !== groupId) {
      // Delete old attendees (but keep the creator)
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

    revalidatePath("/events");
    return { success: true, event: updatedEvent };
  } catch (error) {
    console.error("Error editing event:", error);
    return { error: "An error occurred while editing the event." };
  }
}