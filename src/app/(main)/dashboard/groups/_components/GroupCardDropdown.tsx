'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGroupModals } from '@/hooks/useModal';
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
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              useGroupModals.getState().open('invite', { groupId: group.id })
            }
          >
            Invite Member
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              useGroupModals.getState().open('edit', {
                groupId: group.id,
                name: group.name,
                description: group.description ?? '',
              })
            }
          >
            Edit Group
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              useGroupModals.getState().open('delete', { groupId: group.id })
            }
            className="text-destructive"
          >
            Delete Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
