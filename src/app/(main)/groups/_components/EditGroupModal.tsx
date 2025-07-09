"use client";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/use-modal";
import EditGroupForm from "../forms/EditGroupForm";
import { CreateGroupValues } from "@/validations/group/createGroupSchema";

export default function EditGroupModal() {
  const { type, isOpen, close, data } = useModal();
  if (type !== "edit-group" || !data?.groupId) return null;

  const initialValues = {
    name: data.groupName ?? "",
    description: data.description ?? "",
    image: undefined,
    imageUrl: data.image ?? null,
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent className="space-y-4">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Edit Group</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Update your group details below.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <EditGroupForm
          groupId={data.groupId}
          initialValues={initialValues}
          onSuccess={close}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
