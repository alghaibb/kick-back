"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: string;
  name: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  groupId?: string;
  groups: { id: string; name: string }[];
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
  createdByCurrentUser,
  disabled,
}: EventCardProps) {
  const { open } = useModal();
  const formattedDate = format(
    new Date(date),
    "eeee, MMMM do yyyy \u2022 h:mm a"
  );

  return (
    <div
      className={cn(
        "p-4 border rounded-xl bg-card space-y-1 shadow-sm transition",
        !disabled && "hover:shadow-md",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold text-base">{name}</div>
        <Badge variant="outline" className="text-xs font-normal">
          {createdByCurrentUser ? "Created by you" : "Invited"}
        </Badge>
      </div>
      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}
      <div className="text-xs text-muted-foreground">{formattedDate}</div>

      <div className="flex justify-end mt-2 gap-2">
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
            className="text-primary hover:bg-primary/10"
            aria-label="Edit Event"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => open("delete-event", { eventId: id, eventName: name })}
          className="text-destructive hover:bg-destructive/10"
          disabled={disabled}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
