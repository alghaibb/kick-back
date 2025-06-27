'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGroupModals } from '@/hooks/useModal';
import { MoreVertical, Pencil, Trash2, UserPlus, Users } from 'lucide-react';

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

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                useGroupModals.getState().open('view-members', {
                  groupId: group.id,
                  name: group.name,
                  description: group.description ?? '',
                })
              }
            >
              <Users className="mr-2 h-4 w-4" />
              View Members
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                useGroupModals.getState().open('invite', {
                  groupId: group.id,
                })
              }
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                useGroupModals.getState().open('edit', {
                  groupId: group.id,
                  name: group.name,
                  description: group.description ?? '',
                })
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Group
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                useGroupModals.getState().open('delete', {
                  groupId: group.id,
                })
              }
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Group
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
