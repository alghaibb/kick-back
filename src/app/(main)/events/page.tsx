export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { endOfDay, format, startOfDay } from "date-fns";
import { Calendar } from "lucide-react";
import { Suspense } from "react";
import { CreateActionButton } from "../_components/CreateActionButton";
import { PageHeader } from "../_components/PageHeader";
import { EventCard } from "./_components/EventCard";
import { EventsSkeleton } from "./_components/EventsSkeleton";

async function EventsContent() {
  const session = await getSession();
  if (!session?.user?.id) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          You must be logged in to view events.
        </p>
      </div>
    );
  }

  const groupMemberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    select: { groupId: true },
  });

  const groupIds = groupMemberships.map((gm) => gm.groupId);

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

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const todayEvents = events.filter(
    (e) => new Date(e.date) >= todayStart && new Date(e.date) <= todayEnd
  );
  const upcomingEvents = events.filter((e) => new Date(e.date) > todayEnd);
  const pastEvents = events.filter((e) => new Date(e.date) < todayStart);

  // Fetch all groups for the user
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

  return (
    <div className="space-y-8">
      {/* Today's Events */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Events</h2>
        {todayEvents.length === 0 ? (
          <p className="text-muted-foreground">No events today.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todayEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                name={event.name}
                description={event.description || undefined}
                date={event.date.toISOString()}
                time={format(event.date, "HH:mm")}
                location={event.location || undefined}
                groupId={event.groupId || undefined}
                groups={groups}
                timezone={session.user.timezone || "UTC"}
                createdByCurrentUser={event.createdBy === session.user.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground">No upcoming events.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                name={event.name}
                description={event.description || undefined}
                date={event.date.toISOString()}
                time={format(event.date, "HH:mm")}
                location={event.location || undefined}
                groupId={event.groupId || undefined}
                groups={groups}
                timezone={session.user.timezone || "UTC"}
                createdByCurrentUser={event.createdBy === session.user.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Past Events</h2>
        {pastEvents.length === 0 ? (
          <p className="text-muted-foreground">No past events.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                name={event.name}
                description={event.description || undefined}
                date={event.date.toISOString()}
                time={format(event.date, "HH:mm")}
                location={event.location || undefined}
                groupId={event.groupId || undefined}
                groups={groups}
                timezone={session.user.timezone || "UTC"}
                createdByCurrentUser={event.createdBy === session.user.id}
                disabled={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function Page() {
  return (
    <div className="container py-8">
      <PageHeader
        icon={<Calendar className="h-6 w-6" />}
        title="Events"
        subtitle="Manage and view all your events."
        action={
          <CreateActionButton modalType="create-event" label="Create Event" />
        }
      />

      <Suspense fallback={<EventsSkeleton />}>
        <EventsContent />
      </Suspense>
    </div>
  );
}
