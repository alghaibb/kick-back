"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { Button, LoadingButton } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useRevokeUserSessions } from "@/hooks/queries/useAdminUsers";
import { LogOut } from "lucide-react";

export default function RevokeUserSessionsModal() {
  const { type, data, close } = useModal();
  const revokeMutation = useRevokeUserSessions();

  if (type !== "revoke-user-sessions" || !data?.revokeUserId) return null;

  const handleRevoke = async () => {
    try {
      await revokeMutation.mutateAsync({ userId: data.revokeUserId! });
      close();
    } catch (error) {
      console.error("Revoke sessions error:", error);
    }
  };

  return (
    <GenericModal
      type="revoke-user-sessions"
      title="Revoke User Sessions"
      description={
        <span>
          This will sign out{" "}
          <strong>{data.revokeUserEmail || "this user"}</strong> from all
          devices immediately. The account will remain active.
        </span>
      }
      onCancel={close}
      showCancel={false}
    >
      <div className="flex justify-end gap-3 p-6">
        <Button variant="outline" onClick={close}>
          Cancel
        </Button>
        <LoadingButton
          variant="default"
          onClick={handleRevoke}
          loading={revokeMutation.isPending}
          disabled={revokeMutation.isPending}
          icon={<LogOut className="h-4 w-4" />}
        >
          Revoke Session
        </LoadingButton>
      </div>
    </GenericModal>
  );
}
