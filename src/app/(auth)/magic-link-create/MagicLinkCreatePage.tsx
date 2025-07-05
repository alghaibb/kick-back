import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SocialLoginButton } from "../(oauth)/_components/SocialLoginButton";
import MagicLinkCreateForm from "./MagicLinkCreateForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function MagicLinkCreatePage() {
  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-center">
            Create an Account with{" "}
            <span className="font-bold text-primary">Magic Link</span>
          </CardTitle>
          <CardDescription className="mt-2 md:text-center">
            Enter your details and we&apos;ll send you a magic link to create
            your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SocialLoginButton />
          <Separator className="my-6" />
          <MagicLinkCreateForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
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
        </CardFooter>
      </Card>
    </div>
  );
}
