import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SocialLoginButton } from "../(oauth)/_components/SocialLoginButton";
import CreateAccountForm from "./CreateAccountForm";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
} from "@/components/ui/auth-card";

export default function CreateAccountPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardTitle>
          Join{" "}
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Kick Back
          </span>
        </AuthCardTitle>
        <AuthCardDescription>
          Create your account and start your journey with us
        </AuthCardDescription>
      </AuthCardHeader>

      <AuthCardContent>
        <SocialLoginButton />
        <CreateAccountForm />
      </AuthCardContent>

      <AuthCardFooter>
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
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
