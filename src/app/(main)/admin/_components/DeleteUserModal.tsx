"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useDeleteUser } from "@/hooks/queries/useAdminUsers";
import { Trash2, AlertTriangle } from "lucide-react";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";

export function DeleteUserModal() {
  const { type, data, close } = useModal();
  const deleteUserMutation = useDeleteUser();

  if (type !== "delete-user" || !data?.userId || !data?.userName) {
    return null;
  }

  const handleDelete = async () => {
    if (!data.userId) return;

    try {
      await deleteUserMutation.mutateAsync(data.userId);
      close();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <GenericModal
      type="delete-user"
      title="Delete User"
      description={`Are you sure you want to delete ${data.userName}? This action cannot be undone.`}
      showCancel={false}
      onCancel={close}
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="relative overflow-hidden rounded-xl border border-destructive/50 bg-destructive/5 p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/20 blur-lg" />
              <div className="relative h-10 w-10 bg-gradient-to-br from-destructive to-destructive/80 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
              </div>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-destructive mb-1">Warning</p>
              <p className="text-destructive/80 leading-relaxed">
                This will delete the user account and transfer any group
                ownership to other members. The account can be recovered within
                30 days.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={close}
            className="hover:bg-muted/50 transition-colors"
          >
            Cancel
          </Button>
          <EnhancedLoadingButton
            variant="destructive"
            action="delete"
            loadingText="Deleting..."
            onClick={handleDelete}
            loading={deleteUserMutation.isPending}
            disabled={deleteUserMutation.isPending}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Delete User
          </EnhancedLoadingButton>
        </div>
      </div>
    </GenericModal>
  );
}
