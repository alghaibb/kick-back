import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch events that have been cancelled
    const cancelledEvents = await prisma.event.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { attendees: { some: { userId: session.user.id } } },
          { group: { members: { some: { userId: session.user.id } } } },
        ],
        // Include events that have been marked as cancelled (either via exceptions or isCancelled flag)
        OR: [
          // Cancelled recurring events (via exceptions)
          {
            exceptions: {
              some: {
                isCancelled: true,
              },
            },
          },
          // Cancelled non-recurring events (via isCancelled flag)
          {
            isCancelled: true,
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        date: true,
        groupId: true,
        createdBy: true,
        isRecurring: true,
        recurrenceId: true,
        recurrenceRule: true,
        isCancelled: true,
        cancelledAt: true,
        group: {
          select: { id: true, name: true, image: true },
        },
        attendees: {
          where: { userId: session.user.id },
          select: { rsvpStatus: true },
        },
        exceptions: {
          where: {
            isCancelled: true,
          },
          select: {
            id: true,
            isCancelled: true,
            originalDate: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get the most recent cancellation
        },
      },
      orderBy: { date: "desc" },
    });

    // Get all groups for the group selector
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true, name: true, image: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      events: cancelledEvents.map((event) => ({
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
        isRecurring: event.isRecurring,
        recurrenceId: event.recurrenceId,
        recurrenceRule: event.recurrenceRule,
        cancelledDate: event.isCancelled
          ? event.cancelledAt?.toISOString()
          : event.exceptions[0]?.createdAt?.toISOString(),
      })),
      groups,
      userTimezone: session.user.timezone,
    });
  } catch (error) {
    console.error("Cancelled events API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cancelled events" },
      { status: 500 }
    );
  }
}
