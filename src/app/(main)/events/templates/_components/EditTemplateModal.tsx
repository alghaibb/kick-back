"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { useGroups } from "@/hooks/queries/useGroups";
import { EventTemplateForm } from "../../forms/EventTemplateForm";

export function EditTemplateModal() {
  const { type, close, data } = useModal();
  const { data: groupsData } = useGroups();

  const groups = groupsData
    ? [...groupsData.groupsOwned, ...groupsData.groupsIn]
    : [];

  if (type !== "edit-template" || !data?.templateId) return null;

  const editingTemplate = {
    id: data.templateId,
    name: data.templateName || "",
    description: data.templateDescription || null,
    location: data.templateLocation || null,
    time: data.templateTime || null,
    groupId: data.templateGroupId || null,
  };

  const handleSuccess = () => {
    close();
  };

  return (
    <GenericModal
      type="edit-template"
      title="Edit Event Template"
      className="space-y-4"
      showCancel={false}
    >
      <EventTemplateForm
        groups={groups}
        editingTemplate={editingTemplate}
        onSuccess={handleSuccess}
      />
    </GenericModal>
  );
}
