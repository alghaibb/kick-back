"use client";
import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { CreateGroupForm } from "../forms/CreateGroupForm";

export function CreateGroupModal() {
  const { close } = useModal();

  return (
    <GenericModal
      type="create-group"
      title="Create New Group"
      description="Fill out the form to create a group and invite members."
      className="space-y-4"
      showCancel={false}
    >
      <CreateGroupForm onSuccess={close} />
    </GenericModal>
  );
}
