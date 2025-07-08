"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { deleteEventAction } from "../actions";
import { toast } from "sonner";

export function DeleteEventModal() {
  const { isOpen, type, close, data } = useModal();
  const isDeleteModal = type === "delete-event";

  const handleDelete = async () => {
    if (!data?.eventId) return;

    const res = await deleteEventAction(data.eventId);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Event deleted");
      close();
    }
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
        <ResponsiveModalFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
