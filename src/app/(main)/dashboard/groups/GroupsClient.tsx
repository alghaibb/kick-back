'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGroupModal } from '@/hooks/useGroupModal';
import { Plus } from 'lucide-react';
import DeleteGroupModal from './_components/DeleteGroupModal';
import EditGroupModal from './_components/EditGroupModal';
import GroupCardDropdown from './_components/GroupCardDropdown';
import InviteGroupMemberModal from './_components/InviteModal';

interface GroupsClientProps {
  groups: {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date;
  }[];
}

export default function GroupsClient({ groups }: GroupsClientProps) {
  const { open } = useGroupModal();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">All Groups</h2>
        <Button
          onClick={open}
          variant="ghost"
          className="cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t created any groups yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="relative">
                  <GroupCardDropdown
                    group={group}
                    className="absolute -top-3 -right-3"
                  />
                  <div className="space-y-4 pr-10">
                    <CardTitle>{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Created on: {new Date(group.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EditGroupModal />
      <InviteGroupMemberModal />
      <DeleteGroupModal />
    </div>
  );
}
