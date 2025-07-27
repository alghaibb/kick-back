"use client";

import { useEvents, EventData } from "@/hooks/queries/useEvents";
import { EventCard } from "./EventCard";
import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { endOfDay, startOfDay } from "date-fns";
import { formatDate } from "@/lib/date-utils";
import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Clock, History, AlertCircle } from "lucide-react";

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
    return <UnifiedSkeleton variant="card-list" count={3} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold">Unable to load events</h3>
          <p className="text-muted-foreground">
            Failed to load events. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <UnifiedSkeleton variant="card-list" count={3} />;
  }

  const { todayEvents, upcomingEvents, pastEvents } = categorizedEvents;
  const { groups, userTimezone } = data;

  const EventSection = ({
    title,
    icon: Icon,
    events,
    emptyMessage,
    iconColor,
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    events: EventData[];
    emptyMessage: string;
    iconColor: string;
  }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${iconColor} border border-current/20`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-sm">
            {events.length} {events.length === 1 ? "event" : "events"}
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              name={event.name}
              description={event.description || undefined}
              date={event.date}
              time={formatDate(new Date(event.date), { includeTime: true })
                .split(" ")
                .pop()}
              location={event.location || undefined}
              groupId={event.groupId || undefined}
              groups={groups}
              timezone={userTimezone}
              createdByCurrentUser={event.createdBy === user?.id}
              disabled={title === "Past Events"}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Today's Events */}
      <EventSection
        title="Today's Events"
        icon={Clock}
        events={todayEvents}
        emptyMessage="No events scheduled for today. Why not create one?"
        iconColor="from-primary/20 to-primary/30 text-primary"
      />

      {/* Upcoming Events */}
      <EventSection
        title="Upcoming Events"
        icon={Calendar}
        events={upcomingEvents}
        emptyMessage="No upcoming events. Start planning your next gathering!"
        iconColor="from-primary/20 to-primary/30 text-primary"
      />

      {/* Past Events */}
      <EventSection
        title="Past Events"
        icon={History}
        events={pastEvents}
        emptyMessage="No past events to show."
        iconColor="from-muted/20 to-muted/30 text-muted-foreground"
      />
    </div>
  );
}
