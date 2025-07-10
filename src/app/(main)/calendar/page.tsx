export const dynamic = "force-dynamic";

import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CalendarEvent } from "@/types/calender";
import { CalendarPageClient } from "./_components/CalendarPageClient";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "../_components/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Calendar",
  description: "Where you can view your calendar, upon clicking on the dates, it'll show you the list of events you have that day."
}

export default async function Page() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  // Get all group IDs the user belongs to
  const groupMemberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    select: { groupId: true },
  });
  const groupIds = groupMemberships.map((g) => g.groupId);

  // Fetch events
  const eventsRaw = await prisma.event.findMany({
    where: {
      OR: [
        { createdBy: session.user.id },
        { attendees: { some: { userId: session.user.id } } },
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

  const events: CalendarEvent[] = eventsRaw.map((event) => ({
    id: event.id,
    name: event.name,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    date: event.date,
    group: event.group ? { name: event.group.name } : undefined,
    attendees: event.attendees.map((a) => ({
      user: {
        id: a.user.id,
        nickname: a.user.nickname ?? undefined,
        firstName: a.user.firstName ?? undefined,
      },
    })),
  }));

  return (
    <div className="container py-8">
      {/* <h1 className="text-2xl font-bold mb-6">Calendar</h1> */}
      <PageHeader
        icon={<CalendarDays className="h-6 w-6" />}
        title="Your Calendar"
        subtitle="View all your upcoming events here"
        action=""
      />
      <CalendarPageClient events={events} />
    </div>
  );
}
