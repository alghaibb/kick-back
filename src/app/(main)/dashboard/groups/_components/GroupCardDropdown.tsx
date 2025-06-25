'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteModal } from '@/hooks/useDeleteGroupModal';
import { useEditGroupModal } from '@/hooks/useEditGroupModal';
import { useInviteModal } from '@/hooks/useInviteGroupModal';
import { MoreVertical } from 'lucide-react';

interface GroupCardDropdownProps {
  group: {
    id: string;
    name: string;
    description?: string | null;
  };
  className?: string;
}

export default function GroupCardDropdown({
  group,
  className,
}: GroupCardDropdownProps) {
  const { open: openDeleteModal } = useDeleteModal();
  const { open: openInviteModal } = useInviteModal();
  const { open: openEditModal } = useEditGroupModal();

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openInviteModal(group.id)}>
            Invite Member
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              openEditModal({
                groupId: group.id,
                name: group.name,
                description: group.description ?? '',
              })
            }
          >
            Edit Group
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => openDeleteModal(group.id)}
            className="text-destructive"
          >
            Delete Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
