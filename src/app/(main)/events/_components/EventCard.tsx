"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { RSVPButtons } from "@/components/RSVPButtons";

interface EventCardProps {
  id: string;
  name: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  groupId?: string;
  groups: { id: string; name: string }[];
  timezone?: string;
  createdByCurrentUser: boolean;
  disabled?: boolean;
}

export function EventCard({
  id,
  name,
  description,
  date,
  time,
  location,
  groupId,
  groups,
  timezone = "UTC",
  createdByCurrentUser,
  disabled,
}: EventCardProps) {
  const { open } = useModal();

  const eventDate = new Date(date);
  const formattedDate = formatDate(eventDate, {
    includeWeekday: true,
    includeTime: true,
    timeZone: timezone,
  });

  return (
    <div
      className={cn(
        "p-4 rounded-xl border bg-card shadow-sm group transition-all",
        !disabled && "hover:shadow-md hover:border-muted-foreground/30",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      <header className="flex items-start justify-between mb-2">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-base text-foreground">{name}</h3>
          <Badge
            variant="outline"
            className="self-start px-2 py-0.5 text-xs font-medium rounded-full border-muted-foreground/20 text-muted-foreground bg-muted"
          >
            {createdByCurrentUser ? "Created by you" : "Invited"}
          </Badge>
        </div>
      </header>

      {description && (
        <section className="mb-1">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </section>
      )}

      <section className="space-y-1 text-sm text-muted-foreground mb-3">
        <p>
          <span className="font-medium text-foreground">Date:</span>{" "}
          {formattedDate}
        </p>
        {location && (
          <p>
            <span className="font-medium text-foreground">Location:</span>{" "}
            {location}
          </p>
        )}
        {groupId && (
          <p>
            <span className="font-medium text-foreground">Group:</span>{" "}
            {groups.find((g) => g.id === groupId)?.name ?? "N/A"}
          </p>
        )}
      </section>

      {/* RSVP Section */}
      {!disabled && (
        <section className="mt-4 mb-3">
          <RSVPButtons eventId={id} size="sm" />
        </section>
      )}

      <footer className="flex justify-end gap-1 border-t pt-2 mt-2">
        {createdByCurrentUser && !disabled && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              open("edit-event", {
                eventId: id,
                name,
                description,
                date,
                time,
                location,
                groupId,
                groups,
              })
            }
            className="text-muted-foreground hover:text-primary"
            aria-label="Edit Event"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => open("delete-event", { eventId: id, eventName: name })}
          className="text-muted-foreground hover:text-destructive"
          disabled={disabled}
          aria-label="Delete Event"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </footer>
    </div>
  );
}
