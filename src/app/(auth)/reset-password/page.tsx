import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordPage from './ResetPasswordPage';

export const metadata: Metadata = {
  title: 'Reset Password',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
