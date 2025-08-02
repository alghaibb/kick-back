"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { Button, LoadingButton } from "@/components/ui/button";
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
      <div className="flex flex-col gap-6 p-6">
        <div className="relative overflow-hidden rounded-xl border border-green-200/50 bg-green-50/50 p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-lg" />
              <div className="relative h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-green-foreground" />
              </div>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-green-700 mb-1">
                Recovery Information
              </p>
              <p className="text-green-600 leading-relaxed">
                This will restore the user&apos;s account, including their
                profile, groups, events, and all associated data.
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
          <LoadingButton
            variant="default"
            onClick={handleRecover}
            loading={recoverUserMutation.isPending}
            icon={<RotateCcw className="h-4 w-4" />}
          >
            Recover User
          </LoadingButton>
        </div>
      </div>
    </GenericModal>
  );
}
