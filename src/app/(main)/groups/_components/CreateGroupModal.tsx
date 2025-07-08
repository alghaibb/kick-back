"use client";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/use-modal";
import { CreateGroupForm } from "../forms/CreateGroupForm";

export function CreateGroupModal() {
  const { type, isOpen, close } = useModal();

  if (type !== "create-group") return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent className="space-y-4">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Create New Group</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Fill out the form to create a group and invite members.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <CreateGroupForm onSuccess={close} />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
