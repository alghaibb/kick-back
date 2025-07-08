export const dynamic = "force-dynamic";

import { PageHeader } from "../_components/PageHeader";
import { CreateActionButton } from "../_components/CreateActionButton";
import { Calendar } from "lucide-react";
import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { EventCard } from "./_components/EventCard";
import { startOfDay, endOfDay } from "date-fns";

export const metadata: Metadata = {
  title: "Events",
  description: "Where your upcoming and past events will be.",
};

export default async function Page() {
  const session = await getSession();
  if (!session?.user?.id) {
    return (
      <div className="container py-8">
        You must be logged in to view events.
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

  return (
    <div className="container py-8">
      <PageHeader
        icon={<Calendar className="h-6 w-6" />}
        title="Events"
        subtitle="Manage and create events for your groups or personal use."
        action={
          <CreateActionButton modalType="create-event" label="Create Event" />
        }
      />

      {events.length === 0 ? (
        <div className="text-muted-foreground">No events yet.</div>
      ) : (
        <>
          {todayEvents.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Today&apos;s Events
              </h2>
              <div className="space-y-4">
                {todayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    description={event.description || ""}
                    date={event.date.toISOString()}
                    createdByCurrentUser={event.createdBy === session.user.id}
                  />
                ))}
              </div>
            </section>
          )}

          {upcomingEvents.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    description={event.description || ""}
                    date={event.date.toISOString()}
                    createdByCurrentUser={event.createdBy === session.user.id}
                  />
                ))}
              </div>
            </section>
          )}

          {pastEvents.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Past Events</h2>
              <div className="space-y-4">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    description={event.description || ""}
                    date={event.date.toISOString()}
                    createdByCurrentUser={event.createdBy === session.user.id}
                    disabled
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
