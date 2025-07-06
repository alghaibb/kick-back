import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import Link from "next/link";
import ResendOTPModal from "../(resend-otp)/_components/ResendOTPModal";
import VerifyAccountForm from "./VerifyAccountForm";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
} from "@/components/ui/auth-card";

export default function VerifyAccountPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardTitle>
          Verify your{" "}
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Kick Back
          </span>{" "}
          account
        </AuthCardTitle>
        <AuthCardDescription>
          Enter the 6-digit code sent to your email to complete your account
          verification
        </AuthCardDescription>
      </AuthCardHeader>

      <AuthCardContent>
        <VerifyAccountForm />
      </AuthCardContent>

      <AuthCardFooter>
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive a code?{" "}
            <ResponsiveModal>
              <ResponsiveModalTrigger asChild>
                <Button variant="link" className="px-0 cursor-pointer">
                  Resend code
                </Button>
              </ResponsiveModalTrigger>
              <ResendOTPModal />
            </ResponsiveModal>
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </AuthCardFooter>
    </AuthCard>
  );
}
