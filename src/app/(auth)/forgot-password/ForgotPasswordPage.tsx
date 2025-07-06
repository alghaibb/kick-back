import { Button } from "@/components/ui/button";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
} from "@/components/ui/auth-card";

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardTitle>Reset your password</AuthCardTitle>
        <AuthCardDescription>
          Enter your email address and we&apos;ll send you a secure link to reset
          your password
        </AuthCardDescription>
      </AuthCardHeader>

      <AuthCardContent>
        <ForgotPasswordForm />
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
