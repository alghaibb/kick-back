"use client";

import { Button, LoadingButton } from "@/components/ui/button";
import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { useLeaveEvent } from "@/hooks/mutations/useEventMutations";
import { LogOut } from "lucide-react";

export function LeaveEventModal() {
  const { type, close, data } = useModal();
  const leaveEventMutation = useLeaveEvent();

  // Validation logic - only render if we have the required data
  if (type !== "leave-event" || !data?.eventId || !data?.eventName) {
    return null;
  }

  const eventId = data.eventId;
  const eventName = data.eventName;

  const handleLeaveEvent = async () => {
    try {
      await leaveEventMutation.mutateAsync(eventId);
      close();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <GenericModal
      type="leave-event"
      title="Leave Event"
      className="space-y-4"
      showCancel={false}
    >
      <div className="text-sm text-muted-foreground">
        Are you sure you want to leave &quot;{eventName}&quot;? You will no
        longer be able to see event details or receive updates about this event.
      </div>

      <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
        <LogOut className="h-4 w-4 text-yellow-600" />
        <div className="text-sm text-yellow-700 dark:text-yellow-300">
          <p className="font-medium">Note:</p>
          <p>You can always rejoin if you&apos;re invited again.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={close}>
          Cancel
        </Button>
        <LoadingButton
          variant="destructive"
          onClick={handleLeaveEvent}
          disabled={leaveEventMutation.isPending}
          loading={leaveEventMutation.isPending}
        >
          {leaveEventMutation.isPending ? <>Leaving...</> : <>Leave Event</>}
        </LoadingButton>
      </div>
    </GenericModal>
  );
}
