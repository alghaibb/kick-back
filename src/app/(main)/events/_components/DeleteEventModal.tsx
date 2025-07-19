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
import { deleteEventAction } from "../actions";
import { toast } from "sonner";
import { useTransition } from "react";

export function DeleteEventModal() {
  const [isPending, startTransition] = useTransition();
  const { isOpen, type, close, data } = useModal();
  const isDeleteModal = type === "delete-event";

  const handleDelete = () => {
    if (!data?.eventId) return;
    startTransition(async () => {
      const res = await deleteEventAction(data.eventId!);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Event deleted");
        close();
      }
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
          <Button onClick={close}>
            Cancel
          </Button>
           <LoadingButton
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
          >
            {isPending ? "Deleting..." : "Delete Event"}
          </LoadingButton>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
