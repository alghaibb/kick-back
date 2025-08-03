"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { ResponsiveModalFooter } from "@/components/ui/responsive-modal";
import { Button, LoadingButton } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useDeleteGroup } from "@/hooks/mutations/useGroupMutations";

export function DeleteGroupModal() {
  const { type, close, data } = useModal();
  const deleteGroupMutation = useDeleteGroup();

  const handleDelete = () => {
    if (!data?.groupId) return;
    deleteGroupMutation.mutate(data.groupId, {
      onSuccess: () => {
        close();
      },
    });
  };

  if (type !== "delete-group") return null;

  return (
    <GenericModal
      type="delete-group"
      title="Delete Group"
      className="space-y-4"
      showCancel={false}
    >
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{data?.groupName}</span>? This action
        cannot be undone and will remove all group members and associated
        events.
      </p>
      <ResponsiveModalFooter className="flex flex-col md:flex-row space-y-4 md:space-y-0">
        <Button onClick={close} variant="outline">
          Cancel
        </Button>
        <LoadingButton
          variant="destructive"
          onClick={handleDelete}
          loading={deleteGroupMutation.isPending}
        >
          {deleteGroupMutation.isPending ? "Deleting..." : "Delete Group"}
        </LoadingButton>
      </ResponsiveModalFooter>
    </GenericModal>
  );
}
