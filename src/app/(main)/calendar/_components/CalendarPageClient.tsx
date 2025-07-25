"use client";

import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, startOfDay } from "date-fns";
import { useCalendar } from "@/hooks/queries/useCalendar";
import { formatDate } from "@/lib/date-utils";
import { CalendarSkeleton } from "./CalendarSkeleton";

export function CalendarPageClient() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data, isLoading, error } = useCalendar();

  const eventsForDay = useMemo(() => {
    if (!data?.events) return [];
    return data.events.filter((event) =>
      isSameDay(startOfDay(new Date(event.date)), startOfDay(selectedDate))
    );
  }, [data?.events, selectedDate]);

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
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <Calendar
          required
          selected={selectedDate}
          onSelect={setSelectedDate}
          mode="single"
        />
      </div>
      <div className="flex-1 border-l pl-6 overflow-y-auto max-h-[600px]">
        <h3 className="font-semibold text-lg mb-2">
          {format(selectedDate, "PPP")}
        </h3>

        {eventsForDay.length === 0 ? (
          <div className="text-muted-foreground">
            No events scheduled for this day.
          </div>
        ) : (
          <ul>
            {eventsForDay.map((event) => (
              <li
                key={event.id}
                className="p-4 rounded border bg-card space-y-3"
              >
                <div className="font-bold text-lg">{event.name}</div>

                <div className="text-xs text-muted-foreground">
                  {formatDate(new Date(event.date), {
                    includeWeekday: true,
                    includeTime: true,
                  })}
                </div>

                <div className="text-xs mt-1">
                  Location:{" "}
                  <span className="font-medium">{event.location || "N/A"}</span>
                </div>

                <div className="text-sm text-muted-foreground">
                  {event.description}
                </div>

                <div className="text-xs mt-1">
                  {event.group ? (
                    <>
                      Group:{" "}
                      <span className="font-medium">{event.group.name}</span>
                    </>
                  ) : (
                    <>No group</>
                  )}
                </div>

                <div className="mt-2">
                  <div className="font-semibold text-xs mb-1">Attendees:</div>

                  {/* Going Attendees */}
                  {event.attendees.filter((a) => a.rsvpStatus === "yes")
                    .length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                        ✓ Going (
                        {
                          event.attendees.filter((a) => a.rsvpStatus === "yes")
                            .length
                        }
                        )
                      </div>
                      <ul className="flex flex-wrap gap-1">
                        {event.attendees
                          .filter((a) => a.rsvpStatus === "yes")
                          .map((a) => (
                            <li
                              key={a.user.id}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs"
                            >
                              {a.user.nickname || a.user.firstName || "Unnamed"}
                            </li>
                          ))}
                      </ul>
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
                      <ul className="flex flex-wrap gap-1">
                        {event.attendees
                          .filter((a) => a.rsvpStatus === "maybe")
                          .map((a) => (
                            <li
                              key={a.user.id}
                              className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs"
                            >
                              {a.user.nickname || a.user.firstName || "Unnamed"}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Pending Attendees */}
                  {event.attendees.filter((a) => a.rsvpStatus === "pending")
                    .length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                        ⏳ Pending (
                        {
                          event.attendees.filter(
                            (a) => a.rsvpStatus === "pending"
                          ).length
                        }
                        )
                      </div>
                      <ul className="flex flex-wrap gap-1">
                        {event.attendees
                          .filter((a) => a.rsvpStatus === "pending")
                          .map((a) => (
                            <li
                              key={a.user.id}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                              {a.user.nickname || a.user.firstName || "Unnamed"}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Not Going - Only show if there are some */}
                  {event.attendees.filter((a) => a.rsvpStatus === "no").length >
                    0 && (
                    <div className="mb-2">
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                        ✗ Not Going (
                        {
                          event.attendees.filter((a) => a.rsvpStatus === "no")
                            .length
                        }
                        )
                      </div>
                      <ul className="flex flex-wrap gap-1">
                        {event.attendees
                          .filter((a) => a.rsvpStatus === "no")
                          .map((a) => (
                            <li
                              key={a.user.id}
                              className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-xs"
                            >
                              {a.user.nickname || a.user.firstName || "Unnamed"}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
