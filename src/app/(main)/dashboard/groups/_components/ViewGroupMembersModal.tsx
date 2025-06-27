'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { Separator } from '@/components/ui/separator';
import { useGroupModals } from '@/hooks/useModal';
import Image from 'next/image';

interface Member {
  id?: string;
  email: string;
  firstName?: string;
  nickname?: string | null;
  image?: string | null;
  status: 'member' | 'pending';
}

interface ViewMembersModalProps {
  members: Member[];
}

export default function ViewGroupMembersModal({
  members,
}: ViewMembersModalProps) {
  const { type, isOpen, close } = useGroupModals();

  if (type !== 'view-members') return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Group Members</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Here&apos;s everyone in this group including pending invites.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            members.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={member.image ?? '/placeholder-avatar.jpg'}
                    alt={member.nickname ?? member.firstName ?? 'User'}
                    width={28}
                    height={28}
                    className="rounded-full object-cover w-7 h-7"
                  />
                  <span>
                    {member.nickname || member.firstName || member.email}
                  </span>
                </div>
                <Badge
                  variant={
                    member.status === 'pending' ? 'secondary' : 'default'
                  }
                  className="capitalize whitespace-nowrap"
                >
                  {member.status}
                </Badge>
              </div>
            ))
          )}
        </div>

        <Separator className="my-6 md:my-2" />

        <ResponsiveModalFooter>
          <Button onClick={close} className="w-full cursor-pointer">
            Close
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
