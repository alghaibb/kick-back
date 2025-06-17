import { Button } from '@/components/ui/button';
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
} from '@/components/ui/responsive-modal';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import ResendOTPModal from '../(resend-otp)/_components/ResendOTPModal';
import VerifyAccountForm from './VerifyAccountForm';

export default function VerifyAccountPage() {
  return (
    <div className="md:p-8">
      <h2 className="text-2xl md:text-center">
        Verify Your <span className="font-bold text-primary">Kick Back</span>{' '}
        Account
      </h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-center">
        Enter the 6-digit OTP sent to your email to verify your account.
      </p>

      <VerifyAccountForm />

      <Separator className="md:my-6 my-4" />

      <p className="text-sm text-center text-muted-foreground">
        Didn&apos;t receive an OTP?{' '}
        <ResponsiveModal>
          <ResponsiveModalTrigger asChild>
            <Button variant="link" className="px-0 cursor-pointer">
              Resend OTP
            </Button>
          </ResponsiveModalTrigger>
          <ResendOTPModal />
        </ResponsiveModal>
      </p>

      <div className="mt-6 text-center">
        <Button asChild variant="outline">
          <Link href="/" className="w-full md:w-auto">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
