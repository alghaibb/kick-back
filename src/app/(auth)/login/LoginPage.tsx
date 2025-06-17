import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { SocialLoginButton } from '../(oauth)/_components/SocialLoginButton';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="md:p-8">
      <h2 className="text-2xl md:text-center">
        Welcome Back to{' '}
        <span className="font-bold text-primary">Kick Back</span>
      </h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-center">
        Please log in to continue enjoying your personalized experience.
      </p>

      <Separator className="my-6" />
      <SocialLoginButton />
      <Separator className="my-6" />

      <LoginForm />

      <div className="relative flex items-center">
        <div className="flex-1 h-px bg-border"></div>
        <span className="px-3 text-sm font-medium text-muted-foreground">
          OR
        </span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <div className="mt-6 text-center">
        <Button asChild className="w-full" variant="outline">
          <Link href="/magic-link-login">Login with Magic Link</Link>
        </Button>
      </div>

      <Separator className="my-6" />

      <p className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Button asChild variant="link" className="px-0">
          <Link href="/create-account">Create Account</Link>
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
