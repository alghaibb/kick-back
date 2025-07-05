import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SocialLoginButton } from "../(oauth)/_components/SocialLoginButton";
import MagicLinkLoginForm from "./MagicLinkLoginForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function MagicLinkLoginPage() {
  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-center">
            Login with{" "}
            <span className="font-bold text-primary">Magic Link</span>
          </CardTitle>
          <CardDescription className="mt-2 md:text-center">
            Enter your email and we&apos;ll send you a magic link to login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SocialLoginButton />
          <Separator className="my-6" />
          <MagicLinkLoginForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button asChild variant="link" className="px-0">
              <Link href="/magic-link-create">
                Create an account with Magic Link
              </Link>
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
