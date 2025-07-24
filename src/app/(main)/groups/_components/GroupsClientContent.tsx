"use client";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { Pencil, Crown, Users, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { GroupMembersModal } from "./GroupMembersModal";
import InviteButton from "./InviteButton";

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

export function GroupsClientContent({
  groupsOwned,
  groupsIn,
  currentUser,
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
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<FullGroup | null>(null);
  const { open } = useModal();

  const openMembersModal = (group: FullGroup) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Groups You Own */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 text-primary border border-current/20">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Groups You Own
            </h2>
            <p className="text-muted-foreground text-sm">
              {groupsOwned.length}{" "}
              {groupsOwned.length === 1 ? "group" : "groups"}
            </p>
          </div>
        </div>

        {groupsOwned.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">
              You don't own any groups yet. Create your first group to get
              started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupsOwned.map((group) => {
              const memberCount = group.members.length;

              return (
                <div
                  key={group.id}
                  className="p-6 border border-border rounded-xl bg-card flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col items-center gap-6 mb-2 sm:flex-row sm:items-center sm:gap-6">
                    {group.image ? (
                      <div className="relative flex-shrink-0">
                        <div
                          className="relative rounded-2xl overflow-hidden border-2 border-border/50"
                          style={{ width: "96px", height: "96px" }}
                        >
                          <Image
                            src={group.image}
                            alt={group.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                          <Crown className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-border/50 flex items-center justify-center relative flex-shrink-0 rounded-2xl"
                        style={{ width: "96px", height: "96px" }}
                      >
                        <Users className="w-12 h-12 text-muted-foreground" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                          <Crown className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <div className="text-center sm:text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-xl">
                          {group.name}
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          Owner
                        </span>
                      </div>
                      {group.description && (
                        <div className="text-sm text-muted-foreground mb-3">
                          {group.description}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>
                            {memberCount}{" "}
                            {memberCount === 1 ? "member" : "members"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        open("edit-group", {
                          groupId: group.id,
                          groupName: group.name,
                          description: group.description ?? undefined,
                          image: group.image,
                        })
                      }
                      className="text-muted-foreground hover:text-primary w-full sm:w-auto"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <InviteButton
                      groupId={group.id}
                      groupName={group.name}
                      userRole="admin"
                    />
                    <Button
                      variant="outline"
                      onClick={() => openMembersModal(group)}
                      className="w-full sm:w-auto"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Members ({memberCount})
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
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 text-primary border border-current/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Groups You're In
            </h2>
            <p className="text-muted-foreground text-sm">
              {groupsIn.length} {groupsIn.length === 1 ? "group" : "groups"}
            </p>
          </div>
        </div>

        {groupsIn.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">
              You haven't joined any groups yet. Ask for an invitation or find
              groups to join!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupsIn.map((group) => {
              const groupMember = group.members.find(
                (m) => m.userId === currentUser.id
              );
              const userRole = groupMember?.role;
              const memberCount = group.members.length;

              return (
                <div
                  key={group.id}
                  className="p-6 border border-border rounded-xl bg-card flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col items-center gap-6 mb-2 sm:flex-row sm:items-center sm:gap-6">
                    {group.image ? (
                      <div
                        className="relative rounded-2xl overflow-hidden border-2 border-border/50 flex-shrink-0"
                        style={{ width: "96px", height: "96px" }}
                      >
                        <Image
                          src={group.image}
                          alt={group.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-border/50 flex items-center justify-center flex-shrink-0 rounded-2xl"
                        style={{ width: "96px", height: "96px" }}
                      >
                        <Users className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-xl mb-2">
                        {group.name}
                      </div>
                      {group.description && (
                        <div className="text-sm text-muted-foreground mb-3">
                          {group.description}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>
                            {memberCount}{" "}
                            {memberCount === 1 ? "member" : "members"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
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
                      <Users className="h-4 w-4 mr-2" />
                      View Members ({memberCount})
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Group Members Modal */}
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
