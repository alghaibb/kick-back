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
import {
  useDeleteGroup,
  useLeaveGroup,
  useUpdateGroupMemberRole,
  useRemoveGroupMember,
} from "@/hooks/mutations/useGroupMutations";
import Image from "next/image";

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
        nickname?: string | null;
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

  const [members, setMembers] = useState(group.members);

  const deleteGroupMutation = useDeleteGroup();
  const leaveGroupMutation = useLeaveGroup();
  const updateMemberRoleMutation = useUpdateGroupMemberRole();
  const removeMemberMutation = useRemoveGroupMember();

  useEffect(() => {
    setMembers(group.members);
  }, [group.members]);

  const handleRoleChange = (memberId: string, newRole: string) => {
    updateMemberRoleMutation.mutate(
      { groupId: group.id, memberId, newRole },
      {
        onSuccess: () => {
          setMembers((members) =>
            members.map((m) =>
              m.userId === memberId ? { ...m, role: newRole } : m
            )
          );
        },
      }
    );
  };

  const handleRemove = (memberId: string) => {
    removeMemberMutation.mutate(
      { groupId: group.id, memberId },
      {
        onSuccess: () => {
          setMembers((members) => members.filter((m) => m.userId !== memberId));
        },
      }
    );
  };

  const handleDisband = () => {
    deleteGroupMutation.mutate(group.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleLeave = () => {
    leaveGroupMutation.mutate(group.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
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
                <Image
                  src={m.user?.image ?? "/placeholder-avatar.jpg"}
                  alt={m.user?.firstName || ""}
                  width={32}
                  height={32}
                  className="size-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium">
                    {m.user?.nickname || m.user?.firstName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.user?.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner &&
                userId !== m.userId &&
                group.createdBy !== m.userId ? (
                  <Select
                    value={m.role}
                    onValueChange={(role) => handleRoleChange(m.userId, role)}
                    disabled={updateMemberRoleMutation.isPending}
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
                {isOwner &&
                  userId !== m.userId &&
                  group.createdBy !== m.userId && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(m.userId)}
                      disabled={removeMemberMutation.isPending}
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
              disabled={deleteGroupMutation.isPending}
            >
              Disband Group
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleLeave}
              disabled={leaveGroupMutation.isPending}
            >
              Leave Group
            </Button>
          )}
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
