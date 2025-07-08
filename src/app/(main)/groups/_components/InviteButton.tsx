"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";

export default function InviteButton({
  groupId,
  groupName,
  userRole,
}: {
  groupId: string;
  groupName: string;
  userRole?: string;
}) {
  const { open } = useModal();

  return (
    <Button
      onClick={() =>
        open("invite-group", {
          groupId,
          groupName,
          userRole,
        })
      }
    >
      Invite
    </Button>
  );
}
