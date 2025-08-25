"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { useGroups } from "@/hooks/queries/useGroups";
import { EventTemplateForm } from "../../forms/EventTemplateForm";

export function CreateTemplateModal() {
  const { type, close } = useModal();
  const { data: groupsData } = useGroups();

  const groups = groupsData
    ? [...groupsData.groupsOwned, ...groupsData.groupsIn]
    : [];

  if (type !== "create-template") return null;

  const handleSuccess = () => {
    close();
  };

  return (
    <GenericModal
      type="create-template"
      title="Create Event Template"
      className="space-y-4"
      showCancel={false}
    >
      <EventTemplateForm groups={groups} onSuccess={handleSuccess} />
    </GenericModal>
  );
}
