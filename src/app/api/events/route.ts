import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Single optimized query with all relations
    const [events, groups] = await Promise.all([
      prisma.event.findMany({
        where: {
          AND: [
            {
              OR: [
                { createdBy: session.user.id },
                { attendees: { some: { userId: session.user.id } } },
                { group: { members: { some: { userId: session.user.id } } } },
              ],
            },
            // Exclude cancelled recurring event exceptions
            {
              NOT: {
                exceptions: {
                  some: {
                    isCancelled: true,
                  },
                },
              },
            },
            // Exclude cancelled non-recurring events
            {
              isCancelled: false,
            },
          ],
        },
        include: {
          group: {
            select: { id: true, name: true, image: true },
          },
          attendees: {
            where: { userId: session.user.id },
            select: { rsvpStatus: true },
          },
          favorites: {
            where: { userId: session.user.id },
            select: { id: true },
          },
          exceptions: {
            where: {
              OR: [
                { isCancelled: false }, // Include modified exceptions
                { isCancelled: true }, // This will be filtered out by the NOT above
              ],
            },
            select: {
              id: true,
              isCancelled: true,
              modifiedEventId: true,
            },
          },
          _count: {
            select: {
              attendees: true,
              favorites: true,
            },
          },
        },
        orderBy: { date: "asc" },
      }),

      prisma.group.findMany({
        where: {
          OR: [
            { createdBy: session.user.id },
            { members: { some: { userId: session.user.id } } },
          ],
        },
        select: { id: true, name: true, image: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        name: event.name,
        description: event.description,
        location: event.location,
        date: event.date.toISOString(),
        groupId: event.groupId,
        createdBy: event.createdBy,
        group: event.group,
        userRsvpStatus: event.attendees[0]?.rsvpStatus || "pending",
        attendeeCount: event._count.attendees,
        createdByCurrentUser: event.createdBy === session.user.id,
        isFavorited: event.favorites.length > 0,
        favoriteCount: event._count.favorites,
        isRecurring: event.isRecurring,
        recurrenceId: event.recurrenceId,
        recurrenceRule: event.recurrenceRule,
      })),
      groups,
      userTimezone: session.user.timezone,
    });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
