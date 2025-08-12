"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { Button, LoadingButton } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { revokeUserSessions } from "@/app/(main)/admin/actions";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function RevokeUserSessionsModal() {
  const { type, data, close } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  if (type !== "revoke-user-sessions" || !data?.revokeUserId) return null;

  const handleRevoke = async () => {
    try {
      setIsLoading(true);
      const res = await revokeUserSessions(data.revokeUserId!);
      if ((res as any)?.error) {
        console.error("Revoke sessions error:", (res as any).error);
      }
      close();
    } catch (error) {
      console.error("Revoke sessions error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GenericModal
      type="revoke-user-sessions"
      title="Revoke User Sessions"
      description={
        <span>
          This will sign out <strong>{data.revokeUserEmail || "this user"}</strong> from all
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
          loading={isLoading}
          disabled={isLoading}
          icon={<LogOut className="h-4 w-4" />}
        >
          Revoke Sessions
        </LoadingButton>
      </div>
    </GenericModal>
  );
}


