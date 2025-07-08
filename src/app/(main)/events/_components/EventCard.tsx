"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { format } from "date-fns";

interface EventCardProps {
  id: string;
  name: string;
  description?: string;
  date: string;
}

export function EventCard({ id, name, description, date }: EventCardProps) {
  const { open } = useModal();

  const formattedDate = format(new Date(date), "eeee, MMMM do yyyy • h:mm a");

  return (
    <div className="p-4 border rounded bg-card space-y-1">
      <div className="font-semibold text-lg">{name}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
      <div className="text-xs text-muted-foreground">{formattedDate}</div>
      <Button
        variant="destructive"
        size="sm"
        className="mt-2"
        onClick={() => open("delete-event", { eventId: id, eventName: name })}
      >
        Delete
      </Button>
    </div>
  );
}
