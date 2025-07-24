"use client";

import { useEvents } from "@/hooks/queries/useEvents";
import { EventCard } from "./EventCard";
import { EventsSkeleton } from "./EventsSkeleton";
import { endOfDay, format, startOfDay } from "date-fns";
import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";

export function EventsClient() {
  const { data, isLoading, error } = useEvents();
  const { user } = useAuth();

  // Categorize events by time
  const categorizedEvents = useMemo(() => {
    if (!data?.events)
      return { todayEvents: [], upcomingEvents: [], pastEvents: [] };

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const todayEvents = data.events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= todayStart && eventDate <= todayEnd;
    });

    const upcomingEvents = data.events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate > todayEnd;
    });

    const pastEvents = data.events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate < todayStart;
    });

    return { todayEvents, upcomingEvents, pastEvents };
  }, [data?.events]);

  if (isLoading) {
    return <EventsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load events. Please try again.
        </p>
      </div>
    );
  }

  if (!data) {
    return <EventsSkeleton />;
  }

  const { todayEvents, upcomingEvents, pastEvents } = categorizedEvents;
  const { groups, userTimezone } = data;

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
                date={event.date}
                time={format(new Date(event.date), "HH:mm")}
                location={event.location || undefined}
                groupId={event.groupId || undefined}
                groups={groups}
                timezone={userTimezone}
                createdByCurrentUser={event.createdBy === user?.id}
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
                date={event.date}
                time={format(new Date(event.date), "HH:mm")}
                location={event.location || undefined}
                groupId={event.groupId || undefined}
                groups={groups}
                timezone={userTimezone}
                createdByCurrentUser={event.createdBy === user?.id}
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
                date={event.date}
                time={format(new Date(event.date), "HH:mm")}
                location={event.location || undefined}
                groupId={event.groupId || undefined}
                groups={groups}
                timezone={userTimezone}
                createdByCurrentUser={event.createdBy === user?.id}
                disabled={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
