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
import {format} from "date-fns";

export default function EditEventModal() {
  const { type, isOpen, close, data } = useModal();
  if (type !== "edit-event" || !data?.eventId || !data?.groups) return null;

  // Prepare initialValues for the form
  const initialValues = {
    name: data.name ?? "",
    description: data.description ?? "",
    location: data.location ?? "",
    date: data.date ? new Date(data.date) : new Date(),
    time: data.time ?? (data.date ? format(new Date(data.date), "HH:mm") : ""),
    groupId: data.groupId ?? undefined,
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent className="space-y-4">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Edit Event</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <EditEventForm
          eventId={data.eventId}
          initialValues={initialValues}
          groups={data.groups}
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
