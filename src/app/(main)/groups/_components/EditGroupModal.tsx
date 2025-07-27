"use client";
import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import EditGroupForm from "../forms/EditGroupForm";

export function EditGroupModal() {
  const { type, close, data } = useModal();

  // Validation logic - only render if we have the required data
  if (type !== "edit-group" || !data?.groupId) return null;

  const initialValues = {
    name: data.groupName ?? "",
    description: data.description ?? "",
    image: undefined,
    imageUrl: data.image ?? null,
  };

  return (
    <GenericModal
      type="edit-group"
      title="Edit Group"
      description="Update your group details below."
      className="space-y-4"
      showCancel={false}
    >
      <EditGroupForm
        groupId={data.groupId}
        initialValues={initialValues}
        onSuccess={close}
      />
    </GenericModal>
  );
}
