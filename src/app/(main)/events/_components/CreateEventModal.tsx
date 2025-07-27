"use client";
import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { CreateEventForm } from "../forms/CreateEventForm";
import { useEvents } from "@/hooks/queries/useEvents";

export function CreateEventModal() {
  const { close } = useModal();
  const { data } = useEvents();

  return (
    <GenericModal
      type="create-event"
      title="Create New Event"
      className="space-y-4"
    >
      <CreateEventForm groups={data?.groups || []} onSuccess={close} />
    </GenericModal>
  );
}
