import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SocialLoginButton } from "../(oauth)/_components/SocialLoginButton";
import MagicLinkLoginForm from "./MagicLinkLoginForm";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
} from "@/components/ui/auth-card";

export default function MagicLinkLoginPage() {
  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      <AuthCard className="w-full max-w-5xl mx-auto">
        <AuthCardHeader>
          <AuthCardTitle className="text-2xl md:text-center">
            Login with{" "}
            <span className="font-bold text-primary">Magic Link</span>
          </AuthCardTitle>
          <AuthCardDescription className="mt-2 md:text-center">
            Enter your email and we&apos;ll send you a magic link to login.
          </AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          <SocialLoginButton />
          <Separator className="my-6" />
          <MagicLinkLoginForm />
        </AuthCardContent>
        <AuthCardFooter className="flex flex-col gap-4">
          <div className="flex items-center w-full ">
            <div className="flex-1 border-t border-border" />
            <span className="mx-4 text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button asChild variant="link" className="px-0">
              <Link href="/magic-link-create">
                Create an account with Magic Link
              </Link>
            </Button>
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </AuthCardFooter>
      </AuthCard>
    </div>
  );
}
