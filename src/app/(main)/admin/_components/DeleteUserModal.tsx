"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useDeleteUser } from "@/hooks/queries/useAdminUsers";
import { Trash2, AlertTriangle } from "lucide-react";

export function DeleteUserModal() {
  const { type, data, close } = useModal();
  const deleteUserMutation = useDeleteUser();

  if (type !== "delete-user" || !data?.userId || !data?.userName) {
    return null;
  }

  const handleDelete = async () => {
    if (!data.userId) return;

    try {
      await deleteUserMutation.mutateAsync({ userId: data.userId });
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
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="text-sm text-red-700 dark:text-red-300">
            <p className="font-medium">Warning</p>
            <p>
              This will delete the user account and transfer any group ownership
              to other members. The account can be recovered within 30 days.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </>
            )}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
