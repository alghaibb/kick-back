import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="md:p-8">
      <h2 className="text-2xl md:text-center">Forgot Your Password?</h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-center">
        Enter your email address below and we&apos;ll send you a link to reset
        your password.
      </p>

      <ForgotPasswordForm />

      <Separator className="my-6" />

      <p className="text-sm text-center text-muted-foreground">
        Remembered your password?{' '}
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
