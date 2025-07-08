"use client";

import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, startOfDay } from "date-fns";
import { CalendarEvent } from "@/types/calender";

export function CalendarPageClient({ events }: { events: CalendarEvent[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const eventsForDay = useMemo(() => {
    return events.filter((event) =>
      isSameDay(startOfDay(new Date(event.date)), startOfDay(selectedDate))
    );
  }, [events, selectedDate]);

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
                  {format(new Date(event.date), "eeee, MMMM do yyyy • h:mm a")}
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
                  <ul className="flex flex-wrap gap-2">
                    {Array.from(
                      new Map(
                        event.attendees.map((a) => [a.user.id, a])
                      ).values()
                    ).map((a) => (
                      <li
                        key={a.user.id}
                        className="px-2 py-1 bg-muted rounded text-xs"
                      >
                        {a.user.nickname || a.user.firstName || "Unnamed"}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
