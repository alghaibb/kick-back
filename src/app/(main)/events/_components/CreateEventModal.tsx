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
import { CreateEventForm } from "../forms/CreateEventForm";
import { useEvents } from "@/hooks/queries/useEvents";

export function CreateEventModal() {
  const { type, isOpen, close } = useModal();
  const { data } = useEvents();

  if (type !== "create-event") return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent className="space-y-4">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Create New Event</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <CreateEventForm groups={data?.groups || []} onSuccess={close} />
        <ResponsiveModalFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
