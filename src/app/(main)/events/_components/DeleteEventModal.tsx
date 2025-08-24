"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { ResponsiveModalFooter } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import { useModal } from "@/hooks/use-modal";
import { useDeleteEvent } from "@/hooks/mutations/useEventMutations";

export function DeleteEventModal() {
  const { type, close, data } = useModal();
  const deleteEventMutation = useDeleteEvent();

  const handleDelete = () => {
    if (!data?.eventId) return;
    deleteEventMutation.mutate(data.eventId, {
      onSuccess: () => {
        close();
      },
    });
  };

  if (type !== "delete-event") return null;

  return (
    <GenericModal
      type="delete-event"
      title="Delete Event"
      className="space-y-4"
      showCancel={false}
    >
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{data?.eventName}</span>? This action
        cannot be undone.
      </p>
      <ResponsiveModalFooter className="flex flex-col md:flex-row space-y-4 md:space-y-0">
        <Button onClick={close} variant="outline">
          Cancel
        </Button>
        <EnhancedLoadingButton
          variant="destructive"
          onClick={handleDelete}
          loading={deleteEventMutation.isPending}
          disabled={deleteEventMutation.isPending}
          action="delete"
          loadingText="Deleting Event..."
        >
          Delete Event
        </EnhancedLoadingButton>
      </ResponsiveModalFooter>
    </GenericModal>
  );
}
