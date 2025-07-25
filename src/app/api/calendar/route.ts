import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all group IDs the user belongs to
    const groupMemberships = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });
    const groupIds = groupMemberships.map((g) => g.groupId);

    // Fetch events
    const eventsRaw = await prisma.event.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { attendees: { some: { userId } } },
          { groupId: { in: groupIds } },
        ],
      },
      include: {
        group: { select: { name: true } },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                firstName: true,
              },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Format events for client consumption
    const events = eventsRaw.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description ?? undefined,
      location: event.location ?? undefined,
      date: event.date.toISOString(),
      group: event.group ? { name: event.group.name } : undefined,
      attendees: event.attendees.map((a) => ({
        user: {
          id: a.user.id,
          nickname: a.user.nickname ?? undefined,
          firstName: a.user.firstName ?? undefined,
        },
        rsvpStatus: a.rsvpStatus,
      })),
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
} 