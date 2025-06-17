import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { SocialLoginButton } from '../(oauth)/_components/SocialLoginButton';
import MagicLinkLoginForm from './MagicLinkLoginForm';

export default function MagicLinkLoginPage() {
  return (
    <div className="md:p-8">
      <h2 className="text-2xl md:text-center">
        Login with <span className="font-bold text-primary">Magic Link</span>
      </h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-center">
        Enter your email and we&apos;ll send you a magic link to login.
      </p>

      <Separator className="my-6" />
      <SocialLoginButton />
      <Separator className="my-6" />

      <MagicLinkLoginForm />

      <Separator className="my-6" />

      <p className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Button asChild variant="link" className="px-0">
          <Link href="/magic-link-create">
            Create an account with Magic Link
          </Link>
        </Button>
      </p>

      <div className="mt-6 flex flex-col items-center space-y-3">
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to Email & Password Login</Link>
        </Button>

        <Button asChild variant="outline" className="w-full">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
