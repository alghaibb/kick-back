"use client";

import { useEvents, EventData } from "@/hooks/queries/useEvents";
import { EventCard } from "./EventCard";
import { CancelledEventCard } from "./CancelledEventCard";
import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { endOfDay, startOfDay } from "date-fns";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/ui/list-animations";
import { formatDate } from "@/lib/date-utils";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Calendar,
  Clock,
  History,
  AlertCircle,
  Bookmark,
  Star,
  XCircle,
} from "lucide-react";
import EventFilters from "./EventFilters";
import { filterAndSortEvents, defaultFilters } from "@/lib/event-filters";
import type { EventFilters as EventFiltersType } from "@/lib/event-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventTemplatesList } from "../templates/_components/EventTemplatesList";
import { useFavoriteEvents } from "@/hooks/queries/useFavoriteEvents";
import { useCancelledEvents } from "@/hooks/queries/useCancelledEvents";

export function EventsClient() {
  const { data, isLoading, error } = useEvents();
  const { data: favoriteData, isLoading: favoritesLoading } =
    useFavoriteEvents();
  const { data: cancelledData, isLoading: cancelledLoading } =
    useCancelledEvents();
  const { user } = useAuth();
  const [filters, setFilters] = useState<EventFiltersType>(defaultFilters);

  // Apply filters and categorize events
  const { filteredEvents, categorizedEvents } = useMemo(() => {
    if (!data?.events)
      return {
        filteredEvents: [],
        categorizedEvents: {
          todayEvents: [],
          upcomingEvents: [],
          pastEvents: [],
        },
      };

    // Apply search and filters first
    const filtered = filterAndSortEvents(data.events, filters);

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const todayEvents = filtered.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= todayStart && eventDate <= todayEnd;
    });

    const upcomingEvents = filtered.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate > todayEnd;
    });

    const pastEvents = filtered.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate < todayStart;
    });

    return {
      filteredEvents: filtered,
      categorizedEvents: { todayEvents, upcomingEvents, pastEvents },
    };
  }, [data?.events, filters]);

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
        <AnimatedList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <AnimatedListItem key={event.id}>
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
                isFavorited={event.isFavorited}
                isRecurring={event.isRecurring}
                recurrenceId={event.recurrenceId}
                recurrenceRule={event.recurrenceRule}
              />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}
    </div>
  );

  return (
    <Tabs defaultValue="events" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="events" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Events</span>
          <span className="sm:hidden">All</span>
        </TabsTrigger>
        <TabsTrigger value="saved" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Saved
        </TabsTrigger>
        <TabsTrigger value="cancelled" className="flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Cancelled</span>
          <span className="sm:hidden">❌</span>
        </TabsTrigger>
        <TabsTrigger value="templates" className="flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
          <span className="sm:hidden">Tmpl</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="events" className="space-y-8">
        {/* Search and Filters */}
        <EventFilters
          filters={filters}
          onFiltersChange={setFilters}
          groups={groups}
          eventCount={filteredEvents.length}
        />

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
      </TabsContent>

      <TabsContent value="saved" className="space-y-8">
        {favoritesLoading ? (
          <UnifiedSkeleton variant="card-list" count={3} />
        ) : !favoriteData?.events?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No saved events yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Events you save will appear here for quick access
            </p>
          </div>
        ) : (
          <AnimatedList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteData.events.map((event) => (
              <AnimatedListItem key={event.id}>
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
                  groups={data?.groups || []}
                  timezone={data?.userTimezone}
                  createdByCurrentUser={event.createdBy === user?.id}
                  disabled={new Date(event.date) < new Date()}
                  isFavorited={true}
                  isRecurring={event.isRecurring}
                  recurrenceId={event.recurrenceId}
                  recurrenceRule={event.recurrenceRule}
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </TabsContent>

      <TabsContent value="cancelled" className="space-y-8">
        {cancelledLoading ? (
          <UnifiedSkeleton variant="card-list" count={3} />
        ) : !cancelledData?.events?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-orange-100 dark:bg-orange-950/20 p-3 mb-4">
              <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No cancelled events</h3>
            <p className="text-muted-foreground max-w-sm">
              Cancelled events will appear here. You can re-enable them or
              delete them permanently.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  Cancelled Events
                </h3>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                These events are hidden from your main calendar. You can
                re-enable them or delete them permanently.
              </p>
            </div>

            <AnimatedList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cancelledData.events.map((event) => (
                <AnimatedListItem key={event.id}>
                  <CancelledEventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    description={event.description || undefined}
                    date={event.date}
                    time={formatDate(new Date(event.date), {
                      includeTime: true,
                    })
                      .split(" ")
                      .pop()}
                    location={event.location || undefined}
                    groupId={event.groupId || undefined}
                    groups={data?.groups || []}
                    timezone={data?.userTimezone || "UTC"}
                    createdByCurrentUser={event.createdBy === user?.id}
                    isRecurring={event.isRecurring}
                    recurrenceId={event.recurrenceId}
                    recurrenceRule={event.recurrenceRule}
                    cancelledDate={event.cancelledDate}
                  />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </div>
        )}
      </TabsContent>

      <TabsContent value="templates" className="space-y-6">
        <EventTemplatesList />
      </TabsContent>
    </Tabs>
  );
}
