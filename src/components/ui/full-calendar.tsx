"use client";

import * as React from "react";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useModal } from "@/hooks/use-modal";
import { useAuth } from "@/hooks/use-auth";
import { useMoveEvent } from "@/hooks/mutations/useEventMutations";

interface FullCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  events?: Array<{ date: string; id: string; name: string; color?: string }>;
  className?: string;
}

export function FullCalendar({
  selected,
  onSelect,
  events = [],
  className,
}: FullCalendarProps) {
  const { open } = useModal();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const moveEvent = useMoveEvent();

  // Check if custom background is active
  const hasCustomBackground = !!user?.dashboardBackground;

  // Group events by date for quick lookup
  const eventsByDate = React.useMemo(() => {
    const grouped: Record<
      string,
      Array<{ id: string; name: string; color?: string }>
    > = {};
    events.forEach((event) => {
      const dateKey = format(new Date(event.date), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push({
        id: event.id,
        name: event.name,
        color: event.color,
      });
    });
    return grouped;
  }, [events]);

  // Get all days for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days from previous month to fill the first week
  const firstDayOfMonth = monthStart.getDay();
  const daysFromPrevMonth = Array.from({ length: firstDayOfMonth }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfMonth - i));
    return date;
  });

  // Get days from next month to fill the last week
  const lastDayOfMonth = monthEnd.getDay();
  const daysFromNextMonth = Array.from(
    { length: 6 - lastDayOfMonth },
    (_, i) => {
      const date = new Date(monthEnd);
      date.setDate(date.getDate() + i + 1);
      return date;
    }
  );

  const allDays = [...daysFromPrevMonth, ...monthDays, ...daysFromNextMonth];

  const handleDayClick = (date: Date) => {
    onSelect?.(date);
  };

  const handleCreateEvent = (date: Date) => {
    onSelect?.(date);
    open("create-event", {
      date: format(date, "yyyy-MM-dd"),
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarContent = (
    <div className={cn("w-full max-w-4xl mx-auto full-calendar", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <h2 className="text-lg sm:text-2xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="h-8 sm:h-12 flex items-center justify-center text-xs sm:text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {allDays.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] || [];
          const isSelected = selected && isSameDay(day, selected);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={index}
              className={cn(
                "relative min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border rounded-md sm:rounded-lg transition-all duration-200 cursor-pointer",
                !isSelected &&
                  "group hover:bg-accent/80 hover:border-accent-foreground/40 dark:hover:bg-accent/60 dark:hover:border-accent-foreground/50",
                isSelected &&
                  "bg-primary text-primary-foreground border-primary",
                isToday &&
                  !isSelected &&
                  "bg-muted/50 border-muted-foreground/30",
                !isCurrentMonth && "opacity-40"
              )}
              onClick={() => handleDayClick(day)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const eventId = e.dataTransfer.getData("text/event-id");
                if (!eventId) return;
                moveEvent.mutate({ eventId, newDateISO: day.toISOString() });
              }}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium",
                    isSelected && "text-primary-foreground",
                    isToday && !isSelected && "font-bold"
                  )}
                >
                  {format(day, "d")}
                </span>

                {/* Create Event Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 p-0 transition-opacity",
                    !isSelected && "opacity-0 group-hover:opacity-100",
                    isSelected && "opacity-100",
                    "hover:bg-primary hover:text-primary-foreground",
                    isSelected &&
                      "text-primary-foreground hover:bg-primary-foreground/20"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateEvent(day);
                  }}
                  title="Create event on this day"
                >
                  <Plus className="w-3 h-3 sm:w-3 sm:h-3" />
                </Button>
              </div>

              {/* Event Indicators */}
              {dayEvents.length > 0 && (
                <div className="space-y-0.5 sm:space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded truncate",
                        isSelected ? "text-primary-foreground" : "text-primary"
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? event.color
                            ? `${event.color}33`
                            : "rgba(255,255,255,0.2)"
                          : event.color
                            ? `${event.color}1A`
                            : "rgba(59,130,246,0.1)",
                        color: isSelected
                          ? undefined
                          : event.color || undefined,
                      }}
                      title={event.name}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/event-id", event.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                    >
                      {event.name}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs px-1 py-0 h-4 sm:h-5",
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      +{dayEvents.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => handleCreateEvent(new Date())}
          className="w-full sm:w-auto"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event Today
        </Button>
        <Button
          variant="outline"
          onClick={() => handleCreateEvent(selected || new Date())}
          className="w-full sm:w-auto"
          size="lg"
          disabled={!selected}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event on Selected Date
          {selected && ` (${format(selected, "MMM d")})`}
        </Button>
      </div>
    </div>
  );

  // Wrap in Card component when custom background is active
  if (hasCustomBackground) {
    return (
      <Card className="p-6 bg-card border border-border shadow-lg">
        {calendarContent}
      </Card>
    );
  }

  // Return without Card wrapper when no custom background
  return calendarContent;
}
