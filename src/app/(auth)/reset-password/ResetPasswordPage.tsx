import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="md:p-8">
      <h2 className="text-2xl md:text-center">Reset Your Password</h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-center">
        Enter your new password below to reset your password.
      </p>

      <ResetPasswordForm />

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
