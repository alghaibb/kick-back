"use client";

import { Button } from "@/components/ui/button";
import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { Info } from "lucide-react";
import { InviteToEventForm } from "../forms/InviteToEventForm";

export function InviteToEventModal() {
  const { type, close, data } = useModal();

  // Only render if we have the required data
  if (type !== "invite-event" || !data?.eventId || !data?.eventName)
    return null;

  const eventId = data.eventId;
  const eventName = data.eventName;

  const handleClose = () => {
    close();
  };

  return (
    <GenericModal
      type="invite-event"
      title="Invite to Event"
      className="space-y-4"
      showCancel={false}
    >
      <div className="text-sm text-muted-foreground mb-4">
        Send invitations to &quot;{eventName}&quot; via email
      </div>

      {/* Instructions */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">How to invite multiple people:</p>
          <p>
            Separate email addresses with commas. Only users who have signed up
            for the app can be invited.
          </p>
          <p className="text-xs mt-1">
            Example: friend@example.com, colleague@work.com, family@home.com
          </p>
        </div>
      </div>

      <InviteToEventForm eventId={eventId} eventName={eventName} />

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
          Close
        </Button>
      </div>
    </GenericModal>
  );
}
