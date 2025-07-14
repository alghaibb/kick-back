"use client";
import { useState } from "react";
import { Users, Pencil } from "lucide-react";
import InviteButton from "./InviteButton";
import { Button } from "@/components/ui/button";
import { GroupMembersModal } from "./GroupMembersModal";
import { GroupInviteManager } from "./GroupInviteManager";
import { useModal } from "@/hooks/use-modal";
import Image from "next/image";

interface FullGroup {
  id: string;
  name: string;
  createdBy: string;
  members: {
    userId: string;
    role: string;
    user?: {
      id: string;
      firstName?: string;
      email?: string;
      image?: string | null;
    };
  }[];
  description?: string | null;
  image?: string | null;
}

interface GroupInvite {
  groupId: string;
  groupName: string;
  invites: {
    id: string;
    email: string;
    status: string;
    createdAt: string;
    expiresAt: string;
    inviter: {
      firstName: string;
      email: string;
    };
  }[];
}

export function GroupsClientContent({
  groupsOwned,
  groupsIn,
  currentUser,
  groupInvites,
}: {
  groupsOwned: FullGroup[];
  groupsIn: FullGroup[];
  currentUser: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    image?: string | null;
  };
  groupInvites: GroupInvite[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<FullGroup | null>(null);
  const { open } = useModal();

  const openMembersModal = (group: FullGroup) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  const handleInvitesUpdate = () => {
    // This will trigger a re-render of the parent component
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Groups You Own */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Groups You Own</h2>
        {groupsOwned.length === 0 ? (
          <div className="text-muted-foreground mb-4">
            You don&apos;t own any groups yet.
          </div>
        ) : (
          <div className="space-y-4">
            {groupsOwned.map((group) => {
              const groupMember = group.members.find(
                (m) => m.userId === currentUser.id
              );
              const userRole = groupMember?.role;
              const groupInviteData = groupInvites.find(
                (gi) => gi.groupId === group.id
              );

              return (
                <div
                  key={group.id}
                  className="p-4 border rounded bg-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col items-center gap-3 mb-2 sm:flex-row sm:items-center sm:gap-3">
                    {group.image && (
                      <Image
                        src={group.image}
                        alt={group.name}
                        width={64}
                        height={64}
                        className="rounded object-cover border"
                        style={{ minWidth: 64, minHeight: 64 }}
                      />
                    )}
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-lg">{group.name}</div>
                      {group.description && (
                        <div className="text-sm text-muted-foreground">
                          {group.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      aria-label="Edit Group"
                      onClick={() =>
                        open("edit-group", {
                          groupId: group.id,
                          groupName: group.name,
                          description: group.description ?? undefined,
                          image: group.image,
                        })
                      }
                      className="text-muted-foreground hover:text-primary w-full sm:w-auto"
                      title="Edit Group"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <InviteButton
                      groupId={group.id}
                      groupName={group.name}
                      userRole={userRole}
                    />
                    <Button
                      variant="outline"
                      onClick={() => openMembersModal(group)}
                      className="w-full sm:w-auto"
                    >
                      View Members
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Groups You're In */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Groups You&apos;re In</h2>
        {groupsIn.length === 0 ? (
          <div className="text-muted-foreground mb-4">
            You&apos;re not a member of any other groups.
          </div>
        ) : (
          <div className="space-y-4">
            {groupsIn.map((group) => (
              <div
                key={group.id}
                className="p-4 border rounded bg-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col items-center gap-3 mb-2 sm:flex-row sm:items-center sm:gap-3">
                  {group.image && (
                    <Image
                      src={group.image}
                      alt={group.name}
                      width={64}
                      height={64}
                      className="rounded object-cover border"
                      style={{ minWidth: 64, minHeight: 64 }}
                    />
                  )}
                  <div className="text-center sm:text-left">
                    <div className="font-semibold text-lg">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-muted-foreground">
                        {group.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
                  <InviteButton groupId={group.id} groupName={group.name} />
                  <Button
                    variant="outline"
                    onClick={() => openMembersModal(group)}
                    className="w-full sm:w-auto"
                  >
                    View Members
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group Invite Managers */}
      {groupInvites.map((groupInvite) => (
        <GroupInviteManager
          key={groupInvite.groupId}
          groupId={groupInvite.groupId}
          groupName={groupInvite.groupName}
          initialInvites={groupInvite.invites}
          onInvitesUpdate={handleInvitesUpdate}
        />
      ))}

      {/* Members Modal */}
      {selectedGroup && (
        <GroupMembersModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setSelectedGroup(null);
          }}
          group={selectedGroup}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
