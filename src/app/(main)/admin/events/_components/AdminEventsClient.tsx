"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/date-utils";
import {
  ArrowLeft,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  Users,
  MapPin,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAdminEvents } from "@/hooks/queries/useAdminEvents";
import { AdminEventsSkeleton } from "./AdminEventsSkeleton";
import { useModal } from "@/hooks/use-modal";
import { useFilters } from "@/providers/FilterProvider";

interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  groupId: string | null;
  createdBy: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    image?: string | null;
  };
  group?: {
    id: string;
    name: string;
  } | null;
  _count: {
    attendees: number;
  };
  attendees: {
    id: string;
    rsvpStatus: string;
    user: {
      id: string;
      firstName: string;
      lastName: string | null;
      email: string;
      image?: string | null;
    };
  }[];
}

export function AdminEventsClient() {
  const { filters, updateFilter } = useFilters();
  const searchTerm = filters.search || "";
  const eventFilter =
    (filters.eventFilter as "all" | "upcoming" | "past") || "all";

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useAdminEvents();

  const { open } = useModal();

  const handleDeleteEvent = (event: Event) => {
    open("delete-event", {
      eventId: event.id,
      eventName: event.name,
    });
  };

  const handleEditEvent = (event: Event) => {
    open("edit-event", {
      eventId: event.id,
      name: event.name,
      description: event.description || "",
      date: event.date,
      time: new Date(event.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      location: event.location || "",
      groupId: event.groupId || "",
      groups: event.group ? [event.group] : [],
      isAdmin: true,
    });
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return (firstName[0] || "" + (lastName?.[0] || "")).toUpperCase();
  };

  const handleRefresh = () => {
    refetch();
  };

  const filteredEvents = data?.pages.flatMap((page) => page.events) || [];
  const totalEvents = data?.pages[0]?.pagination.total || 0;

  // Filter events based on search and filter
  const displayEvents = (filteredEvents as unknown as Event[]).filter(
    (event: Event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

      const eventDate = new Date(event.date);
      const now = new Date();

      let matchesFilter = true;
      if (eventFilter === "upcoming") {
        matchesFilter = eventDate >= now;
      } else if (eventFilter === "past") {
        matchesFilter = eventDate < now;
      }

      return matchesSearch && matchesFilter;
    }
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-16 md:pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-8 md:mb-10">
          <Button
            asChild
            variant="ghost"
            className="mb-4 md:mb-6 hover:bg-primary/5 transition-colors"
          >
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-xl" />
                  <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-green-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Admin Events
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground/90 mt-1">
                    Monitor and manage all events across the platform.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefetching}
                  className="flex-shrink-0"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, descriptions, locations, or creators..."
              value={searchTerm}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={eventFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("eventFilter", "all")}
              className="flex-1 sm:flex-none min-w-[100px] h-9"
            >
              All Events
            </Button>
            <Button
              variant={eventFilter === "upcoming" ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("eventFilter", "upcoming")}
              className="flex-1 sm:flex-none min-w-[100px] h-9"
            >
              Upcoming
            </Button>
            <Button
              variant={eventFilter === "past" ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("eventFilter", "past")}
              className="flex-1 sm:flex-none min-w-[100px] h-9"
            >
              Past
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Shows skeleton only for data */}
      {isLoading ? (
        <AdminEventsSkeleton />
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load events</p>
        </div>
      ) : (
        <>
          {/* Modern Events List */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-green-500/5 pointer-events-none" />
            <div className="relative z-10">
              <CardHeader className="border-b border-border/50 bg-card/50 pb-4 sm:pb-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl font-semibold">
                      Platform Events
                    </span>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                      {displayEvents.length} of {totalEvents} events
                    </Badge>
                  </div>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  View and manage all events created by users across the
                  platform.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {(displayEvents as Event[]).map((event: Event) => {
                    const eventDate = new Date(event.date);
                    const isUpcoming = eventDate >= new Date();

                    return (
                      <div
                        key={event.id}
                        className="p-4 sm:p-6 md:p-8 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex-shrink-0">
                              <AvatarImage
                                src={event.user.image ?? undefined}
                                alt="Profile"
                              />
                              <AvatarFallback>
                                {getInitials(
                                  event.user.firstName,
                                  event.user.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              {/* Header with event name and status */}
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <h3 className="font-semibold text-base sm:text-lg text-foreground">
                                  {event.name}
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                  <Badge
                                    variant={
                                      isUpcoming ? "default" : "secondary"
                                    }
                                    className={`text-xs ${
                                      isUpcoming
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                                    }`}
                                  >
                                    {isUpcoming ? "Upcoming" : "Past"}
                                  </Badge>
                                  {event.group && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Group Event
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Creator info */}
                              <div className="mb-3">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">
                                    Created by:
                                  </span>{" "}
                                  {event.user.firstName} {event.user.lastName}
                                  <br className="sm:hidden" />
                                  <span className="hidden sm:inline"> (</span>
                                  <span className="sm:hidden"> - </span>
                                  {event.user.email}
                                  <span className="hidden sm:inline">)</span>
                                </p>
                              </div>

                              {/* Event details */}
                              <div className="mb-3">
                                {event.description && (
                                  <div className="mb-2">
                                    <p className="text-sm text-muted-foreground">
                                      {event.description}
                                    </p>
                                  </div>
                                )}
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-muted-foreground">
                                      {formatDate(event.date, {
                                        includeTime: true,
                                        format: "default",
                                        locale: "en-GB",
                                      })}
                                    </span>
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 flex-shrink-0" />
                                      <span className="text-muted-foreground">
                                        {event.location}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-muted-foreground">
                                      {event._count.attendees} attendees
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Group info */}
                              {event.group && (
                                <div className="mb-3">
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                      Group:
                                    </span>{" "}
                                    {event.group.name}
                                  </p>
                                </div>
                              )}

                              {/* Attendees list */}
                              {event.attendees.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <span className="font-medium text-foreground">
                                      Attendees:
                                    </span>
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {event.attendees
                                      .slice(0, 5)
                                      .map((attendee) => (
                                        <div
                                          key={attendee.id}
                                          className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full"
                                        >
                                          <Avatar className="h-4 w-4">
                                            <AvatarImage
                                              src={
                                                attendee.user.image ?? undefined
                                              }
                                              alt="Profile"
                                            />
                                            <AvatarFallback className="text-xs">
                                              {getInitials(
                                                attendee.user.firstName,
                                                attendee.user.lastName
                                              )}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-xs text-muted-foreground">
                                            {attendee.user.firstName}{" "}
                                            {attendee.user.lastName}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="text-xs h-4 px-1"
                                          >
                                            {attendee.rsvpStatus
                                              .charAt(0)
                                              .toUpperCase() +
                                              attendee.rsvpStatus.slice(1)}
                                          </Badge>
                                        </div>
                                      ))}
                                    {event.attendees.length > 5 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{event.attendees.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Created date */}
                              <div className="mb-3">
                                <p className="text-sm text-muted-foreground">
                                  Created on{" "}
                                  {formatDate(event.createdAt, {
                                    includeTime: true,
                                    format: "default",
                                    locale: "en-GB",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Dropdown Menu - Admin actions */}
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Event
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteEvent(event)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="p-4 sm:p-6 border-t border-border">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="w-full"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}

                {/* No events message */}
                {displayEvents.length === 0 && (
                  <div className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm || eventFilter !== "all"
                        ? "No events match your search criteria."
                        : "No events found on the platform."}
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
