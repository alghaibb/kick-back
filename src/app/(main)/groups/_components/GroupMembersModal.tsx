"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  updateGroupMemberRoleAction,
  removeGroupMemberAction,
  deleteGroupAction,
  leaveGroupAction,
} from "../actions";

interface GroupMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: {
    id: string;
    name: string;
    createdBy: string;
    members: Array<{
      userId: string;
      role: string;
      user?: {
        id: string;
        firstName?: string;
        email?: string;
        image?: string | null;
      };
    }>;
  };
  currentUser: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    image?: string | null;
  };
}

export function GroupMembersModal({
  open,
  onOpenChange,
  group,
  currentUser,
}: GroupMembersModalProps) {
  const userId = currentUser.id;
  const isOwner = group.createdBy === userId;
  const isAdmin = group.members.some(
    (m) => m.userId === userId && m.role === "admin"
  );

  const [members, setMembers] = useState(group.members);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMembers(group.members);
  }, [group.members]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setLoading(true);
    const res = await updateGroupMemberRoleAction({
      groupId: group.id,
      memberId,
      newRole,
    });
    if (res?.success) {
      setMembers((members) =>
        members.map((m) =>
          m.userId === memberId ? { ...m, role: newRole } : m
        )
      );
      toast.success("Role updated");
    } else {
      toast.error(res?.error || "Failed to update role");
    }
    setLoading(false);
  };

  const handleRemove = async (memberId: string) => {
    setLoading(true);
    const res = await removeGroupMemberAction({ groupId: group.id, memberId });
    if (res?.success) {
      setMembers((members) => members.filter((m) => m.userId !== memberId));
      toast.success("Member removed");
    } else {
      toast.error(res?.error || "Failed to remove member");
    }
    setLoading(false);
  };

  const handleDisband = async () => {
    setLoading(true);
    const res = await deleteGroupAction(group.id);
    if (res?.success) {
      toast.success("Group disbanded");
      onOpenChange(false);
      // Optionally refresh the page or redirect
    } else {
      toast.error(res?.error || "Failed to disband group");
    }
    setLoading(false);
  };

  const handleLeave = async () => {
    setLoading(true);
    const res = await leaveGroupAction(group.id);
    if (res?.success) {
      toast.success("You left the group");
      onOpenChange(false);
      // Optionally refresh the page or redirect
    } else {
      toast.error(res?.error || "Failed to leave group");
    }
    setLoading(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="space-y-2">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Members of {group.name}</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <div className="space-y-4">
          {members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center justify-between gap-2 border-b pb-2"
            >
              <div className="flex items-center gap-2">
                <img
                  src={m.user?.image ?? "/placeholder-avatar.jpg"}
                  alt={m.user?.firstName || ""}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium">{m.user?.firstName}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.user?.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(isOwner || isAdmin) &&
                userId !== m.userId &&
                group.createdBy !== m.userId ? (
                  <Select
                    value={m.role}
                    onValueChange={(role) => handleRoleChange(m.userId, role)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="capitalize text-sm">{m.role}</span>
                )}
                {(isOwner || isAdmin) &&
                  userId !== m.userId &&
                  group.createdBy !== m.userId && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(m.userId)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  )}
                {group.createdBy === m.userId && (
                  <span className="text-xs text-primary font-bold ml-2">
                    Owner
                  </span>
                )}
                {userId === m.userId && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (You)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <ResponsiveModalFooter className="flex flex-col gap-2 mt-4">
          {isOwner ? (
            <Button
              variant="destructive"
              onClick={handleDisband}
              disabled={loading}
            >
              Disband Group
            </Button>
          ) : (
            <Button variant="outline" onClick={handleLeave} disabled={loading}>
              Leave Group
            </Button>
          )}
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
