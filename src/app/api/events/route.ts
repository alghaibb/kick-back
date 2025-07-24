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

    // Get user's group memberships
    const groupMemberships = await prisma.groupMember.findMany({
      where: { userId: session.user.id },
      select: { groupId: true },
    });

    const groupIds = groupMemberships.map((gm) => gm.groupId);

    // Fetch events
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { attendees: { some: { userId: session.user.id } } },
          { groupId: { in: groupIds } },
        ],
      },
      orderBy: { date: "asc" },
    });

    // Fetch user's groups for event display
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      events: events.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        location: event.location,
        date: event.date.toISOString(),
        groupId: event.groupId,
        createdBy: event.createdBy,
      })),
      groups,
      userTimezone: session.user.timezone || "UTC",
    });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
} 