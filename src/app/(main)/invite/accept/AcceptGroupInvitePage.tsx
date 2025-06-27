'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { acceptGroupInvite } from './actions';

export default function AcceptGroupInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      toast.error('Invite token is missing.');
      router.push('/');
      return;
    }

    acceptGroupInvite(token).then((res) => {
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('You have joined the group!');
        router.push(res.redirectTo || '/dashboard/groups');
      }
    });
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-muted-foreground">Accepting your invitation...</p>
    </div>
  );
}
