import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { SocialLoginButton } from '../(oauth)/_components/SocialLoginButton';
import CreateAccountForm from './CreateAccountForm';

export default function CreateAccountPage() {
  return (
    <div className="md:p-8">
      <h2 className="text-2xl md:text-center">
        Welcome to <span className="font-bold text-primary">Kick Back</span>
      </h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-center">
        We&apos;re excited to have you here! Please create an account to get started.
      </p>

      <Separator className="my-6" />
      <SocialLoginButton />
      <Separator className="my-6" />

      <CreateAccountForm />

      <div className="relative flex items-center">
        <div className="flex-1 h-px bg-border"></div>
        <span className="px-3 text-sm font-medium text-muted-foreground">
          OR
        </span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <div className="mt-6 text-center">
        <Button asChild className="w-full" variant="outline">
          <Link href="/magic-link-create">Create account with Magic Link</Link>
        </Button>
      </div>

      <Separator className="my-6" />

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <Button asChild variant="link" className="px-0">
          <Link href="/login">Login</Link>
        </Button>
      </p>

      <div className="mt-6 text-center">
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
