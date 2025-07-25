"use client";

import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, isSameDay, startOfDay } from "date-fns";
import { useCalendar } from "@/hooks/queries/useCalendar";
import { formatDate } from "@/lib/date-utils";
import { CalendarSkeleton } from "./CalendarSkeleton";
import EventCommentsForm from "@/app/(main)/events/comments/_components/EventCommentsForm";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function CalendarPageClientWithComments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const { data, isLoading, error } = useCalendar();

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
    return <CalendarSkeleton />;
  }

  if (error) {
    return (
      <div className="text-muted-foreground">
        Failed to load calendar events. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <Calendar
          required
          selected={selectedDate}
          onSelect={setSelectedDate}
          mode="single"
        />
      </div>
      <div className="flex-1 border-l pl-6 overflow-y-auto max-h-[800px]">
        <h3 className="font-semibold text-lg mb-4">
          {format(selectedDate, "PPP")}
        </h3>

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
                <div className="border rounded-lg bg-card">
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
                              .map((a) => a.user.firstName)
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
                              .map((a) => a.user.firstName)
                              .join(", ")}
                          </div>
                        </div>
                      )}

                      {/* Pending Attendees */}
                      {event.attendees.filter((a) => a.rsvpStatus === "pending")
                        .length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-muted-foreground font-medium mb-1">
                            ⏳ Pending (
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
                              .map((a) => a.user.firstName)
                              .join(", ")}
                          </div>
                        </div>
                      )}

                      {/* Not Going Attendees */}
                      {event.attendees.filter((a) => a.rsvpStatus === "no")
                        .length > 0 && (
                        <div>
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
                              .map((a) => a.user.firstName)
                              .join(", ")}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comments Toggle Button */}
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-4">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {expandedEvents.has(event.id) ? "Hide" : "View"}{" "}
                        Discussion
                        {expandedEvents.has(event.id) ? (
                          <ChevronUp className="h-4 w-4 ml-2" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-2" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  {/* Event Comments Section */}
                  <CollapsibleContent>
                    <div className="border-t p-4">
                      <EventCommentsForm eventId={event.id} />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
