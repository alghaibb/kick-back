"use client";

import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { useModal } from "@/hooks/use-modal";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format, isSameDay, startOfDay } from "date-fns";
import { useCalendar } from "@/hooks/queries/useCalendar";
import { formatDate } from "@/lib/date-utils";
import { UnifiedSkeleton } from "@/components/ui/skeleton";

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
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CalendarPageClientWithComments() {
  const searchParams = useSearchParams();
  const targetEventId = searchParams.get("event");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const { data, isLoading, error } = useCalendar();
  const modal = useModal();
  const [openCmd, setOpenCmd] = useState(false);
  // Keyboard shortcuts: N create, E edit selected day
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas/contenteditable or when a modal is open
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName?.toLowerCase();
      const isEditable =
        !!t &&
        (t.isContentEditable ||
          tag === "input" ||
          tag === "textarea" ||
          t.getAttribute("role") === "textbox");
      if (isEditable || modal.isOpen) return;

      const isK = (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      if (isK) {
        e.preventDefault();
        setOpenCmd((v) => !v);
        return;
      }
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        modal.open("create-event", {
          date: new Date().toISOString().slice(0, 10),
        });
      }
      if (e.key.toLowerCase() === "e") {
        const sameDayEvents = (data?.events || []).filter((ev) =>
          isSameDay(new Date(ev.date), selectedDate)
        );
        if (sameDayEvents.length > 0) {
          e.preventDefault();
          const firstEvent = sameDayEvents.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )[0];
          modal.open("edit-event", {
            eventId: firstEvent.id,
            name: firstEvent.name,
            date: firstEvent.date,
          });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modal, data?.events, selectedDate]);
  // Listen for edit-open events from calendar cells
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { eventId?: string };
      if (!detail?.eventId || !data?.events) return;
      const ev = data.events.find((x) => x.id === detail.eventId);
      if (!ev) return;
      // Open the edit modal with minimal required data; groups will be fetched in modal
      modal.open("edit-event", {
        eventId: ev.id,
        name: ev.name,
        description: ev.description ?? undefined,
        location: ev.location ?? undefined,
        date: ev.date,
        groupId: ev.groupId ?? undefined,
      });
    };
    window.addEventListener("open-edit-event", handler as EventListener);
    return () =>
      window.removeEventListener("open-edit-event", handler as EventListener);
  }, [data?.events, modal]);

  useEffect(() => {
    if (targetEventId && data?.events) {
      const targetEvent = data.events.find(
        (event) => event.id === targetEventId
      );
      if (targetEvent) {
        const eventDate = new Date(targetEvent.date);
        setSelectedDate(eventDate);
        setExpandedEvents(new Set([targetEventId]));

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
      <div className="flex flex-col gap-8">
        <UnifiedSkeleton variant="calendar-month" />
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 bg-card/50">
                <div className="h-5 w-40 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
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
      <CommandDialog open={openCmd} onOpenChange={setOpenCmd}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setOpenCmd(false);
                modal.open("create-event", {
                  date: new Date().toISOString().slice(0, 10),
                });
              }}
            >
              Create event (N)
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const sameDayEvents = (data?.events || []).filter((ev) =>
                  isSameDay(new Date(ev.date), selectedDate)
                );
                if (sameDayEvents.length) {
                  const firstEvent = sameDayEvents.sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )[0];
                  modal.open("edit-event", {
                    eventId: firstEvent.id,
                    name: firstEvent.name,
                    date: firstEvent.date,
                  });
                }
                setOpenCmd(false);
              }}
            >
              Edit first event (E)
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
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

                      <div className="mt-2">
                        <div className="font-semibold text-xs mb-1">
                          Attendees:
                        </div>

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
                                <UnifiedSkeleton variant="form" count={3} />
                              }
                            >
                              <PhotoUploadForm eventId={event.id} />
                            </Suspense>
                            <Suspense
                              fallback={
                                <UnifiedSkeleton
                                  variant="gallery-grid"
                                  count={8}
                                />
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
