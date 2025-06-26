import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Metadata } from 'next';
import { Suspense } from 'react';
import VerifyMagicLinkPage from './VerifyMagicLinkPage';

export const metadata: Metadata = {
  title: 'Verify Email',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyMagicLinkPage />
    </Suspense>
  );
}
