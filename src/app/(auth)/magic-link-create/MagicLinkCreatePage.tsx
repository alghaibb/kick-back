import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SocialLoginButton } from "../(oauth)/_components/SocialLoginButton";
import MagicLinkCreateForm from "./MagicLinkCreateForm";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
} from "@/components/ui/auth-card";

export default function MagicLinkCreatePage() {
  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      <AuthCard className="w-full max-w-5xl mx-auto">
        <AuthCardHeader>
          <AuthCardTitle className="text-2xl md:text-center">
            Create an Account with{" "}
            <span className="font-bold text-primary">Magic Link</span>
          </AuthCardTitle>
          <AuthCardDescription className="mt-2 md:text-center">
            Enter your details and we&apos;ll send you a magic link to create
            your account.
          </AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          <SocialLoginButton />
          <Separator className="my-6" />
          <MagicLinkCreateForm />
        </AuthCardContent>
        <AuthCardFooter className="flex flex-col gap-4">
          <div className="flex items-center w-full ">
            <div className="flex-1 border-t border-border" />
            <span className="mx-4 text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Button asChild variant="link" className="px-0">
              <Link href="/magic-link-login">Login with Magic Link</Link>
            </Button>
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to Email & Password Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </AuthCardFooter>
      </AuthCard>
    </div>
  );
}
