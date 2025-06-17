'use client';

import { LoadingButton } from '@/components/ui/button';
import { useTransition } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { googleLogin } from '../actions'; // adjust import path as needed

export function SocialLoginButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col space-y-3">
      <LoadingButton
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 cursor-pointer"
        onClick={() => startTransition(() => googleLogin())}
        disabled={isPending}
        loading={isPending}
      >
        <FcGoogle className="size-5" />
        {isPending ? 'Logging in with Google...' : 'Continue with Google'}
      </LoadingButton>
    </div>
  );
}
