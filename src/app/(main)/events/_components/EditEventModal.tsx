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
import EditEventForm from "../forms/EditEventForm";
import { CreateEventValues } from "@/validations/events/createEventSchema";

interface EditEventModalProps {
  eventId: string;
  initialValues: CreateEventValues;
  groups: { id: string; name: string }[];
}

export default function EditEventModal({
  eventId,
  initialValues,
  groups,
}: EditEventModalProps) {
  const { type, isOpen, close } = useModal();
  if (type !== "edit-event") return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent className="space-y-4">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Edit Event</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <EditEventForm
          eventId={eventId}
          initialValues={initialValues}
          groups={groups}
          onSuccess={close}
        />
        <ResponsiveModalFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
