'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { verifyMagicLink } from './actions';

export default function VerifyMagicLinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      toast.error('Verification token missing.');
      router.push('/');
      return;
    }

    verifyMagicLink(token).then((res) => {
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Your email has been verified!');
        router.push(res.redirectTo || '/onboarding');
      }
    });
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-muted-foreground">Verifying your email...</p>
    </div>
  );
}
