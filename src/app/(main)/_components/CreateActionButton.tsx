"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModalType, useModal } from "@/hooks/use-modal";

export function CreateActionButton({
  modalType,
  label,
}: {
  modalType: ModalType;
  label: string;
}) {
  const { open } = useModal();
  return (
    <Button
      type="button"
      className="mt-4 sm:mt-0 gap-2"
      variant="default"
      size="lg"
      onClick={() => open(modalType)}
    >
      <Plus className="size-4" />
      {label}
    </Button>
  );
}
