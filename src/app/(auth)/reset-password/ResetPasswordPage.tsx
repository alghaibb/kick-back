import { Button } from "@/components/ui/button";
import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
} from "@/components/ui/auth-card";

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardTitle>Set new password</AuthCardTitle>
        <AuthCardDescription>
          Enter your new password below to complete the reset process
        </AuthCardDescription>
      </AuthCardHeader>

      <AuthCardContent>
        <ResetPasswordForm />
      </AuthCardContent>

      <AuthCardFooter>
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Button asChild variant="link" className="px-0">
              <Link href="/login">Log in here</Link>
            </Button>
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </AuthCardFooter>
    </AuthCard>
  );
}
