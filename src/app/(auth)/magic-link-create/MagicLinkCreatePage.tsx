import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { SocialLoginButton } from '../(oauth)/_components/SocialLoginButton';
import MagicLinkCreateForm from './MagicLinkCreateForm';

export default function MagicLinkCreatePage() {
  return (
    <div className="md:p-8">
      <h2 className="text-2xl md:text-center">
        Create an Account with{' '}
        <span className="font-bold text-primary">Magic Link</span>
      </h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-center">
        Enter your details and we&apos;ll send you a magic link to create your
        account.
      </p>

      <Separator className="my-6" />
      <SocialLoginButton />
      <Separator className="my-6" />

      <MagicLinkCreateForm />

      <Separator className="my-6" />

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <Button asChild variant="link" className="px-0">
          <Link href="/magic-link-login">Login with Magic Link</Link>
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
