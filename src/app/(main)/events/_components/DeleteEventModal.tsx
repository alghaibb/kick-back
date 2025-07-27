"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Button, LoadingButton } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useDeleteEvent } from "@/hooks/mutations/useEventMutations";

export function DeleteEventModal() {
  const { isOpen, type, close, data } = useModal();
  const isDeleteModal = type === "delete-event";
  const deleteEventMutation = useDeleteEvent();

  const handleDelete = () => {
    if (!data?.eventId) return;
    deleteEventMutation.mutate(data.eventId, {
      onSuccess: () => {
        close();
      },
    });
  };

  if (!isDeleteModal) return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent className="space-y-4">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Delete Event</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{data?.eventName}</span>? This action
          cannot be undone.
        </p>
        <ResponsiveModalFooter className="flex flex-col md:flex-row space-y-4 md:space-y-0">
          <Button onClick={close} variant="outline">Cancel</Button>
          <LoadingButton
            variant="destructive"
            onClick={handleDelete}
            loading={deleteEventMutation.isPending}
          >
            {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
          </LoadingButton>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
