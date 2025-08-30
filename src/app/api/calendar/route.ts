export const dynamic = "force-dynamic";
export const revalidate = 0;
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const eventsRaw = await prisma.event.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { attendees: { some: { userId } } },
          { group: { members: { some: { userId } } } },
        ],
      },
      include: {
        group: { select: { id: true, name: true } },
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
      color: (event as { color?: string }).color ?? undefined,
      groupId: (event as { groupId?: string | null }).groupId ?? null,
      createdBy: event.createdBy,
      group: event.group
        ? { id: event.group.id, name: event.group.name }
        : null,
      attendees: event.attendees.map((a) => ({
        user: {
          id: a.user.id,
          nickname: a.user.nickname ?? undefined,
          firstName: a.user.firstName ?? undefined,
        },
        rsvpStatus: a.rsvpStatus,
      })),
    }));

    return NextResponse.json(
      { events },
      { headers: { "cache-control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
