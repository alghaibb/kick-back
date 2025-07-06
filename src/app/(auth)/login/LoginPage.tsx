import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SocialLoginButton } from "../(oauth)/_components/SocialLoginButton";
import LoginForm from "./LoginForm";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
} from "@/components/ui/auth-card";

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardTitle>
          Welcome back to{" "}
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Kick Back
          </span>
        </AuthCardTitle>
        <AuthCardDescription>
          Log in to your account to continue your journey
        </AuthCardDescription>
      </AuthCardHeader>

      <AuthCardContent>
        <SocialLoginButton />
        <LoginForm />
      </AuthCardContent>

      <AuthCardFooter>
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button asChild variant="link" className="px-0">
              <Link href="/create-account">Create one now</Link>
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
