"use client";

import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format, isSameDay, startOfDay } from "date-fns";
import { useCalendar } from "@/hooks/queries/useCalendar";
import { formatDate } from "@/lib/date-utils";
import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { ActionLoader } from "@/components/ui/loading-animations";

// Lazy load heavy components
const FullCalendar = lazy(() =>
  import("@/components/ui/full-calendar").then((m) => ({
    default: m.FullCalendar,
  }))
);
const ThreadedEventComments = lazy(
  () => import("@/app/(main)/events/comments/_components/ThreadedEventComments")
);
const PhotoUploadForm = lazy(() =>
  import("@/app/(main)/events/photos/_components/PhotoUploadForm").then(
    (m) => ({ default: m.PhotoUploadForm })
  )
);
const PhotoGallery = lazy(() =>
  import("@/app/(main)/events/photos/_components/PhotoGallery").then((m) => ({
    default: m.PhotoGallery,
  }))
);
const EventLocationPoll = lazy(() =>
  import("@/app/(main)/events/_components/EventLocationPoll").then((m) => ({
    default: m.EventLocationPoll,
  }))
);

import { MessageCircle, ChevronDown, ChevronUp, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function CalendarPageClientWithComments() {
  const searchParams = useSearchParams();
  const targetEventId = searchParams.get("event");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const { data, isLoading, error } = useCalendar();

  // Handle navigation from notifications
  useEffect(() => {
    if (targetEventId && data?.events) {
      const targetEvent = data.events.find(
        (event) => event.id === targetEventId
      );
      if (targetEvent) {
        const eventDate = new Date(targetEvent.date);
        setSelectedDate(eventDate);
        setExpandedEvents(new Set([targetEventId]));

        // Scroll to the event after a short delay to ensure DOM is updated
        setTimeout(() => {
          const eventElement = document.getElementById(
            `event-${targetEventId}`
          );
          if (eventElement) {
            eventElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    }
  }, [targetEventId, data?.events]);

  const eventsForDay = useMemo(() => {
    if (!data?.events) return [];
    return data.events.filter((event) =>
      isSameDay(startOfDay(new Date(event.date)), startOfDay(selectedDate))
    );
  }, [data?.events, selectedDate]);

  const toggleEventExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <ActionLoader action="sync" size="lg" />
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-muted-foreground">
        Failed to load calendar events. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Calendar Section - Full width */}
      <div className="w-full">
        <Suspense fallback={<UnifiedSkeleton className="h-[400px] w-full" />}>
          <FullCalendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            events={data?.events || []}
            className="w-full"
          />
        </Suspense>
      </div>

      {/* Events Panel - Full width below calendar */}
      <div className="w-full">
        <div
          className="overflow-y-auto max-h-[600px]"
          ref={scrollContainerRef}
          style={{ scrollBehavior: "auto" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              {format(selectedDate, "PPP")}
            </h3>
          </div>

          {eventsForDay.length === 0 ? (
            <div className="text-muted-foreground">
              No events scheduled for this day.
            </div>
          ) : (
            <div className="space-y-4">
              {eventsForDay.map((event) => (
                <Collapsible
                  key={event.id}
                  open={expandedEvents.has(event.id)}
                  onOpenChange={() => toggleEventExpanded(event.id)}
                >
                  <div
                    id={`event-${event.id}`}
                    className="border rounded-lg bg-card"
                  >
                    {/* Event Header */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-lg">{event.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(new Date(event.date), {
                              includeWeekday: true,
                              includeTime: true,
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs mt-1">
                        Location:{" "}
                        <span className="font-medium">
                          {event.location || "N/A"}
                        </span>
                      </div>

                      {event.description && (
                        <div className="text-sm text-muted-foreground">
                          {event.description}
                        </div>
                      )}

                      <div className="text-xs mt-1">
                        {event.group ? (
                          <>
                            Group:{" "}
                            <span className="font-medium">
                              {event.group.name}
                            </span>
                          </>
                        ) : (
                          <>No group</>
                        )}
                      </div>

                      {/* Attendees Summary */}
                      <div className="mt-2">
                        <div className="font-semibold text-xs mb-1">
                          Attendees:
                        </div>

                        {/* Going Attendees */}
                        {event.attendees.filter((a) => a.rsvpStatus === "yes")
                          .length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                              ✓ Going (
                              {
                                event.attendees.filter(
                                  (a) => a.rsvpStatus === "yes"
                                ).length
                              }
                              )
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.attendees
                                .filter((a) => a.rsvpStatus === "yes")
                                .map((a) => a.user.nickname || a.user.firstName)
                                .join(", ")}
                            </div>
                          </div>
                        )}

                        {/* Maybe Attendees */}
                        {event.attendees.filter((a) => a.rsvpStatus === "maybe")
                          .length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mb-1">
                              ? Maybe (
                              {
                                event.attendees.filter(
                                  (a) => a.rsvpStatus === "maybe"
                                ).length
                              }
                              )
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.attendees
                                .filter((a) => a.rsvpStatus === "maybe")
                                .map((a) => a.user.nickname || a.user.firstName)
                                .join(", ")}
                            </div>
                          </div>
                        )}

                        {/* Not Going Attendees */}
                        {event.attendees.filter((a) => a.rsvpStatus === "no")
                          .length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                              ✗ Not Going (
                              {
                                event.attendees.filter(
                                  (a) => a.rsvpStatus === "no"
                                ).length
                              }
                              )
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.attendees
                                .filter((a) => a.rsvpStatus === "no")
                                .map((a) => a.user.nickname || a.user.firstName)
                                .join(", ")}
                            </div>
                          </div>
                        )}

                        {/* No Response Attendees */}
                        {event.attendees.filter(
                          (a) => a.rsvpStatus === "pending"
                        ).length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                              ○ No Response (
                              {
                                event.attendees.filter(
                                  (a) => a.rsvpStatus === "pending"
                                ).length
                              }
                              )
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.attendees
                                .filter((a) => a.rsvpStatus === "pending")
                                .map((a) => a.user.nickname || a.user.firstName)
                                .join(", ")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Discussion & Photos Toggle Button */}
                    <div className="border-t bg-muted/30">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {expandedEvents.has(event.id) ? "Hide" : "View"}{" "}
                          Discussion & Photos
                          {expandedEvents.has(event.id) ? (
                            <ChevronUp className="h-4 w-4 ml-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    {/* Event Discussion & Photos Section */}
                    <CollapsibleContent>
                      <div className="border-t p-4">
                        <Tabs defaultValue="comments" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger
                              value="comments"
                              className="flex items-center gap-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Comments
                            </TabsTrigger>
                            <TabsTrigger
                              value="poll"
                              className="flex items-center gap-2"
                            >
                              Poll
                            </TabsTrigger>
                            <TabsTrigger
                              value="photos"
                              className="flex items-center gap-2"
                            >
                              <Camera className="h-4 w-4" />
                              Photos
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="comments" className="mt-4">
                            <Suspense
                              fallback={
                                <UnifiedSkeleton className="h-[200px]" />
                              }
                            >
                              <ThreadedEventComments eventId={event.id} />
                            </Suspense>
                          </TabsContent>
                          <TabsContent value="poll" className="mt-4">
                            <Suspense
                              fallback={
                                <UnifiedSkeleton className="h-[160px]" />
                              }
                            >
                              <EventLocationPoll eventId={event.id} />
                            </Suspense>
                          </TabsContent>
                          <TabsContent
                            value="photos"
                            className="mt-4 space-y-6"
                          >
                            <Suspense
                              fallback={
                                <UnifiedSkeleton className="h-[100px]" />
                              }
                            >
                              <PhotoUploadForm eventId={event.id} />
                            </Suspense>
                            <Suspense
                              fallback={
                                <UnifiedSkeleton className="h-[300px]" />
                              }
                            >
                              <PhotoGallery eventId={event.id} />
                            </Suspense>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
