"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { ResponsiveModalFooter } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import { useModal } from "@/hooks/use-modal";
import { useDeleteEventTemplate } from "@/hooks/mutations/useEventTemplateMutations";

export function DeleteTemplateModal() {
  const { type, close, data } = useModal();
  const deleteTemplateMutation = useDeleteEventTemplate();

  const handleDelete = () => {
    if (!data?.templateId) return;
    deleteTemplateMutation.mutate(data.templateId, {
      onSuccess: () => {
        close();
      },
    });
  };

  if (type !== "delete-template") return null;

  return (
    <GenericModal
      type="delete-template"
      title="Delete Template"
      className="space-y-4"
      showCancel={false}
    >
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete
        {" "}
        <span className="font-semibold">{data?.templateName}</span>?
        {" "}
        This action cannot be undone.
      </p>
      <ResponsiveModalFooter className="flex flex-col md:flex-row space-y-4 md:space-y-0">
        <Button onClick={close} variant="outline">
          Cancel
        </Button>
        <EnhancedLoadingButton
          variant="destructive"
          onClick={handleDelete}
          loading={deleteTemplateMutation.isPending}
          disabled={deleteTemplateMutation.isPending}
          action="delete"
          loadingText="Deleting Template..."
        >
          Delete Template
        </EnhancedLoadingButton>
      </ResponsiveModalFooter>
    </GenericModal>
  );
}


