import prisma from "@/lib/prisma";
import { format } from "date-fns";

export async function getDashboardStats(userId: string) {
  let upcomingEvents = 0;
  let groups = 0;
  let eventsCreated = 0;
  let activeGroups = 0;
  let nextEventDate: Date | null = null;
  let upcomingCreatedEvents = 0;

  if (userId) {
    groups = await prisma.groupMember.count({ where: { userId } });
    eventsCreated = await prisma.event.count({ where: { createdBy: userId } });
    upcomingEvents = await prisma.event.count({
      where: {
        date: { gte: new Date() },
        group: { members: { some: { userId } } },
      },
    });
    const nextEvent = await prisma.event.findFirst({
      where: {
        date: { gte: new Date() },
        group: { members: { some: { userId } } },
      },
      orderBy: { date: "asc" },
      select: { date: true },
    });
    nextEventDate = nextEvent?.date ?? null;
    upcomingCreatedEvents = await prisma.event.count({
      where: { createdBy: userId, date: { gte: new Date() } },
    });
    activeGroups = await prisma.group.count({
      where: {
        members: { some: { userId } },
        events: { some: { date: { gte: new Date() } } },
      },
    });
  }

  return {
    upcomingEvents,
    groups,
    eventsCreated,
    activeGroups,
    nextEventDate,
    upcomingCreatedEvents,
    nextEventDateFormatted:
      upcomingEvents > 0 && nextEventDate
        ? `Next event: ${format(nextEventDate, "MMM d, yyyy")}`
        : "No upcoming events",
    upcomingCreatedEventsText:
      upcomingCreatedEvents > 0
        ? `Upcoming: ${upcomingCreatedEvents}`
        : "No upcoming events created",
  };
} 