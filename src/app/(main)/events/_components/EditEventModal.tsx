"use client";
import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import EditEventForm from "../forms/EditEventForm";
import { format } from "date-fns";
import { useGroups } from "@/hooks/queries/useGroups";

export default function EditEventModal() {
  const { type, close, data } = useModal();
  const { data: groupsData } = useGroups();

  if (type !== "edit-event" || !data?.eventId) return null;

  const initialValues = {
    name: data.name ?? "",
    description: data.description ?? "",
    location: data.location ?? "",
    date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
    time: data.date ? format(new Date(data.date), "HH:mm") : "",
    groupId: data.groupId ?? undefined,
  };

  return (
    <GenericModal type="edit-event" title="Edit Event" className="space-y-4">
      <EditEventForm
        eventId={data.eventId}
        initialValues={initialValues}
        groups={
          data.groups ??
          groupsData?.groupsOwned?.concat(groupsData?.groupsIn ?? []) ??
          []
        }
        onSuccess={close}
        isAdmin={data?.isAdmin}
        editAllInSeries={data?.editAllInSeries}
      />
    </GenericModal>
  );
}
