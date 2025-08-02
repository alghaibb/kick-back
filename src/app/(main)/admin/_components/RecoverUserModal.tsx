"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useRecoverUser } from "@/hooks/queries/useAdminDeletedUsers";
import { RotateCcw, CheckCircle } from "lucide-react";

export function RecoverUserModal() {
  const { type, data, close } = useModal();
  const recoverUserMutation = useRecoverUser();

  if (type !== "recover-user" || !data?.userId || !data?.userName) {
    return null;
  }

  const handleRecover = async () => {
    if (!data.userId) return;
    try {
      await recoverUserMutation.mutateAsync({ userId: data.userId });
      close();
    } catch (error) {
      console.error("Error recovering user:", error);
    }
  };

  return (
    <GenericModal
      type="recover-user"
      title="Recover User"
      description={`Are you sure you want to recover ${data.userName}? This will restore their account and all associated data.`}
      showCancel={false}
      onCancel={close}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="text-sm text-green-700 dark:text-green-300">
            <p className="font-medium">Recovery Information</p>
            <p>
              This will restore the user&apos;s account, including their
              profile, groups, events, and all associated data.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleRecover}
            disabled={recoverUserMutation.isPending}
          >
            {recoverUserMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Recovering...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Recover User
              </>
            )}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
