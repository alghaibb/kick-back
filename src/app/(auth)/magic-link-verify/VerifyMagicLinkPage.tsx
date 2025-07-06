"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { verifyMagicLink } from "./actions";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
} from "@/components/ui/auth-card";
import { Spinner } from "@/components/ui/spinner";

export default function VerifyMagicLinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Verification token missing.");
      router.push("/");
      return;
    }

    verifyMagicLink(token).then((res) => {
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Your email has been verified!");
        router.push(res.redirectTo || "/onboarding");
      }
    });
  }, [searchParams, router]);

  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      <AuthCard className="w-full max-w-md mx-auto">
        <AuthCardHeader>
          <AuthCardTitle>Verifying Your Email</AuthCardTitle>
          <AuthCardDescription>
            Please wait while we verify your magic link...
          </AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Spinner className="h-8 w-8" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </div>
        </AuthCardContent>
      </AuthCard>
    </div>
  );
}
