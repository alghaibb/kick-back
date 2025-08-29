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
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useModal } from "@/hooks/use-modal";
import { useAuth } from "@/hooks/use-auth";
import { useMoveEvent } from "@/hooks/mutations/useEventMutations";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";

interface FullCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  events?: Array<{
    date: string;
    id: string;
    name: string;
    color?: string;
    groupId?: string | null;
    createdBy?: string;
  }>;
  className?: string;
}

export function FullCalendar({
  selected,
  onSelect,
  events = [],
  className,
}: FullCalendarProps) {
  type CalendarEvent = NonNullable<FullCalendarProps["events"]>[number];
  const { open } = useModal();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [view, setView] = React.useState<"month" | "week" | "list">(() => {
    if (typeof window === "undefined") return "month";
    const saved = localStorage.getItem("calendar:view");
    return saved === "week" || saved === "list" ? saved : "month";
  });
  const moveEvent = useMoveEvent();

  const hasCustomBackground = !!user?.dashboardBackground;

  React.useEffect(() => {
    try {
      localStorage.setItem("calendar:view", view);
    } catch {}
  }, [view]);

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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfMonth = monthStart.getDay();
  const daysFromPrevMonth = Array.from({ length: firstDayOfMonth }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfMonth - i));
    return date;
  });

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
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold truncate">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant={view === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("month")}
              aria-pressed={view === "month"}
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("week")}
              aria-pressed={view === "week"}
            >
              Week
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              List
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      <div className="sm:hidden flex items-center justify-center gap-1 mb-3">
        <Button
          variant={view === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("month")}
          aria-pressed={view === "month"}
          className="flex-1"
        >
          Month
        </Button>
        <Button
          variant={view === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("week")}
          aria-pressed={view === "week"}
          className="flex-1"
        >
          Week
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
          aria-pressed={view === "list"}
          className="flex-1"
        >
          List
        </Button>
      </div>

      {view !== "list" && (
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
      )}

      {view === "month" && (
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {allDays.map((day, index) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate[dateKey] || [];
            const isSelected = selected && isSameDay(day, selected);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <ContextMenu key={`day-${dateKey}-${index}`}>
                <ContextMenuTrigger asChild>
                  <div
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
                      moveEvent.mutate({
                        eventId,
                        newDateStr: format(day, "yyyy-MM-dd"),
                      });
                    }}
                  >
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

                    {dayEvents.length > 0 && (
                      <div className="space-y-0.5 sm:space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <ContextMenu key={event.id}>
                            <ContextMenuTrigger asChild>
                              <div
                                className={cn(
                                  "text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded truncate",
                                  isSelected
                                    ? "text-primary-foreground"
                                    : "text-primary"
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
                                  e.dataTransfer.setData(
                                    "text/event-id",
                                    event.id
                                  );
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const openEvent = new CustomEvent(
                                    "open-edit-event",
                                    {
                                      detail: { eventId: event.id },
                                    }
                                  );
                                  window.dispatchEvent(openEvent);
                                }}
                              >
                                {event.name}
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-48">
                              <ContextMenuItem
                                onSelect={() => {
                                  const openEvent = new CustomEvent(
                                    "open-edit-event",
                                    {
                                      detail: { eventId: event.id },
                                    }
                                  );
                                  window.dispatchEvent(openEvent);
                                }}
                              >
                                Edit
                              </ContextMenuItem>
                              <ContextMenuItem
                                onSelect={() => {
                                  const today = new Date();
                                  moveEvent.mutate({
                                    eventId: event.id,
                                    newDateStr: format(today, "yyyy-MM-dd"),
                                  });
                                }}
                              >
                                Move to today
                              </ContextMenuItem>
                              <ContextMenuItem
                                onSelect={() => {
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  moveEvent.mutate({
                                    eventId: event.id,
                                    newDateStr: format(tomorrow, "yyyy-MM-dd"),
                                  });
                                }}
                              >
                                Move to tomorrow
                              </ContextMenuItem>
                              <ContextMenuItem
                                onSelect={async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      `${window.location.origin}/events?event=${event.id}`
                                    );
                                    toast.success("Event link copied");
                                  } catch {
                                    toast.error("Failed to copy link");
                                  }
                                }}
                              >
                                Copy link
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
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
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem
                    onSelect={() => {
                      handleCreateEvent(day);
                    }}
                  >
                    Create event here
                  </ContextMenuItem>
                  <ContextMenuItem
                    onSelect={() => {
                      onSelect?.(day);
                    }}
                  >
                    Select this day
                  </ContextMenuItem>
                  <ContextMenuItem
                    onSelect={() => {
                      const today = new Date();
                      onSelect?.(today);
                    }}
                  >
                    Go to today
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      )}

      {view === "week" &&
        (() => {
          const base = selected || currentMonth;
          const ws = startOfWeek(base, { weekStartsOn: 0 });
          const we = endOfWeek(base, { weekStartsOn: 0 });
          const weekDays = eachDayOfInterval({ start: ws, end: we });
          return (
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {weekDays.map((day, index) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDate[dateKey] || [];
                const isSelected = selected && isSameDay(day, selected);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);
                return (
                  <ContextMenu key={`week-${dateKey}-${index}`}>
                    <ContextMenuTrigger asChild>
                      <div
                        className={cn(
                          "relative min-h-[120px] p-2 border rounded-md sm:rounded-lg transition-all duration-200 cursor-pointer",
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
                          const eventId =
                            e.dataTransfer.getData("text/event-id");
                          if (!eventId) return;
                          moveEvent.mutate({
                            eventId,
                            newDateStr: format(day, "yyyy-MM-dd"),
                          });
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isSelected && "text-primary-foreground",
                              isToday && !isSelected && "font-bold"
                            )}
                          >
                            {format(day, "EEE d")}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                              "h-6 w-6 p-0 transition-opacity",
                              !isSelected &&
                                "opacity-0 group-hover:opacity-100",
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
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        {dayEvents.length > 0 && (
                          <div className="space-y-1">
                            {dayEvents.slice(0, 5).map((event) => (
                              <div
                                key={event.id}
                                className={cn(
                                  "text-xs px-2 py-1 rounded truncate",
                                  isSelected
                                    ? "text-primary-foreground"
                                    : "text-primary"
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
                                  e.dataTransfer.setData(
                                    "text/event-id",
                                    event.id
                                  );
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const openEvent = new CustomEvent(
                                    "open-edit-event",
                                    {
                                      detail: { eventId: event.id },
                                    }
                                  );
                                  window.dispatchEvent(openEvent);
                                }}
                              >
                                {event.name}
                              </div>
                            ))}
                            {dayEvents.length > 5 && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0 h-5"
                              >
                                +{dayEvents.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem onSelect={() => handleCreateEvent(day)}>
                        Create event here
                      </ContextMenuItem>
                      <ContextMenuItem onSelect={() => onSelect?.(day)}>
                        Select this day
                      </ContextMenuItem>
                      <ContextMenuItem
                        onSelect={() => {
                          const today = new Date();
                          onSelect?.(today);
                        }}
                      >
                        Go to today
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          );
        })()}

      {view === "list" &&
        (() => {
          const monthEvents: CalendarEvent[] = events
            .filter((ev) => isSameMonth(new Date(ev.date), currentMonth))
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
          const grouped: Record<string, CalendarEvent[]> = {};
          monthEvents.forEach((ev) => {
            const key = format(new Date(ev.date), "yyyy-MM-dd");
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(ev);
          });
          const keys = Object.keys(grouped).sort();
          return keys.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No events this month.
            </div>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <div key={key} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm sm:text-base">
                      {format(new Date(key), "EEE, MMM d")}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateEvent(new Date(key))}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      New
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {grouped[key].map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between gap-2 p-2 rounded hover:bg-accent/50 cursor-pointer"
                        onClick={() => {
                          const openEvent = new CustomEvent("open-edit-event", {
                            detail: { eventId: ev.id },
                          });
                          window.dispatchEvent(openEvent);
                        }}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {ev.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(ev.date), "p")}
                          </div>
                        </div>
                        <div
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: ev.color || "var(--primary)",
                          }}
                          aria-label="event color"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

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

  if (hasCustomBackground) {
    return (
      <Card className="p-6 bg-card border border-border shadow-lg">
        {calendarContent}
      </Card>
    );
  }

  return calendarContent;
}
