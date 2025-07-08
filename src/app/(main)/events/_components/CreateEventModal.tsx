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

export function CreateEventModal({
  groups,
}: {
  groups: { id: string; name: string }[];
}) {
  const { type, isOpen, close } = useModal();
  if (type !== "create-event") return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent className="space-y-4">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Create New Event</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <CreateEventForm groups={groups} onSuccess={close} />
        <ResponsiveModalFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
