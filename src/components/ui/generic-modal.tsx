"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import type { ModalType } from "@/hooks/use-modal";

interface GenericModalProps {
  type: ModalType;
  title: string;
  description?: string;
  children: React.ReactNode;
  showCancel?: boolean;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
}

export function GenericModal({
  type,
  title,
  description,
  children,
  showCancel = true,
  cancelText = "Cancel",
  onCancel,
  className,
}: GenericModalProps) {
  const { type: currentType, isOpen, close } = useModal();

  if (currentType !== type) return null;

  const handleCancel = () => {
    onCancel?.();
    close();
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent className={className}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
          {description && (
            <ResponsiveModalDescription>{description}</ResponsiveModalDescription>
          )}
        </ResponsiveModalHeader>
        {children}
        {showCancel && (
          <ResponsiveModalFooter>
            <Button variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
          </ResponsiveModalFooter>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
