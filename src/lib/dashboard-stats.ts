import prisma from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { formatDate } from "./date-utils";

export async function getDashboardStats(userId: string, userTimezone?: string) {
  let upcomingEvents = 0;
  let groups = 0;
  let eventsCreated = 0;
  let activeGroups = 0;
  let nextEventDate: Date | null = null;
  let upcomingCreatedEvents = 0;
  let todaysEventsCount = 0;
  let nextTodayEvent: { name: string; date: Date } | null = null;
  let savedEventsCount = 0;

  if (userId) {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    groups = await prisma.groupMember.count({ where: { userId } });
    eventsCreated = await prisma.event.count({ where: { createdBy: userId } });
    savedEventsCount = await prisma.eventFavorite.count({ where: { userId } });

    const todaysEvents = await prisma.event.findMany({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        OR: [
          { group: { members: { some: { userId } } } },
          { createdBy: userId },
        ],
      },
      orderBy: { date: "asc" },
      select: { id: true, name: true, date: true },
    });
    todaysEventsCount = todaysEvents.length;
    nextTodayEvent = todaysEvents[0] ?? null;

    upcomingEvents = await prisma.event.count({
      where: {
        date: { gte: now },
        OR: [
          { group: { members: { some: { userId } } } },
          { createdBy: userId },
        ],
      },
    });

    const nextEvent = await prisma.event.findFirst({
      where: {
        date: { gte: now },
        OR: [
          { group: { members: { some: { userId } } } },
          { createdBy: userId },
        ],
      },
      orderBy: { date: "asc" },
      select: { date: true },
    });
    nextEventDate = nextEvent?.date ?? null;

    upcomingCreatedEvents = await prisma.event.count({
      where: { createdBy: userId, date: { gte: now } },
    });
    activeGroups = await prisma.group.count({
      where: {
        members: { some: { userId } },
        events: { some: { date: { gte: now } } },
      },
    });
  }

  return {
    todaysEventsCount,
    nextTodayEvent,
    upcomingEvents,
    groups,
    eventsCreated,
    activeGroups,
    nextEventDate,
    upcomingCreatedEvents,
    savedEventsCount,
    nextEventDateFormatted:
      upcomingEvents > 0 && nextEventDate
        ? `Next event: ${formatDate(nextEventDate, { includeWeekday: true, includeTime: true, ...(userTimezone && { timeZone: userTimezone }) })}`
        : "No upcoming events scheduled",
    upcomingCreatedEventsText:
      upcomingCreatedEvents > 0
        ? `You have ${upcomingCreatedEvents} upcoming event${upcomingCreatedEvents > 1 ? "s" : ""} created`
        : "No upcoming events you've created",
    nextTodayEventText: nextTodayEvent
      ? `Next event today: ${nextTodayEvent.name} at ${formatDate(nextTodayEvent.date, { includeTime: true, includeWeekday: true, ...(userTimezone && { timeZone: userTimezone }) })}`
      : todaysEventsCount > 0
        ? "All of today's events have passed"
        : "No events scheduled for today",
    todaysEventsLabel:
      todaysEventsCount === 1 ? "Today's event" : "Today's events",
  };
}
