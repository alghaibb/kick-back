"use client";
import { useState } from "react";
import { Users } from "lucide-react";
import InviteButton from "./InviteButton";
import { Button } from "@/components/ui/button";
import { GroupMembersModal } from "./GroupMembersModal";

export default function GroupsClient({
  groupsOwned,
  groupsIn,
  currentUser,
}: {
  groupsOwned: any[];
  groupsIn: any[];
  currentUser: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    image?: string | null;
  };
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  const openMembersModal = (group: any) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="h-6 w-6" /> Your Groups
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold text-lg mb-2">Groups You Own</h2>
          {groupsOwned.length === 0 ? (
            <div className="text-muted-foreground mb-4">
              You don't own any groups yet.
            </div>
          ) : (
            <div className="space-y-4">
              {groupsOwned.map((group) => (
                <div
                  key={group.id}
                  className="p-4 border rounded flex items-center justify-between bg-card"
                >
                  <div>
                    <div className="font-semibold text-lg">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-muted-foreground">
                        {group.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <InviteButton groupId={group.id} groupName={group.name} />
                    <Button
                      variant="outline"
                      onClick={() => openMembersModal(group)}
                    >
                      View Members
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">Groups You're In</h2>
          {groupsIn.length === 0 ? (
            <div className="text-muted-foreground mb-4">
              You're not a member of any other groups.
            </div>
          ) : (
            <div className="space-y-4">
              {groupsIn.map((group) => (
                <div
                  key={group.id}
                  className="p-4 border rounded flex items-center justify-between bg-card"
                >
                  <div>
                    <div className="font-semibold text-lg">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-muted-foreground">
                        {group.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <InviteButton groupId={group.id} groupName={group.name} />
                    <Button
                      variant="outline"
                      onClick={() => openMembersModal(group)}
                    >
                      View Members
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
