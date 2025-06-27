import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Metadata } from 'next';
import { Suspense } from 'react';
import AcceptGroupInvitePage from './AcceptGroupInvitePage';

export const metadata: Metadata = {
  title: 'Accept Invite',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AcceptGroupInvitePage />
    </Suspense>
  );
}
