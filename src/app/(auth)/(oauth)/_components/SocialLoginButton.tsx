"use client";

import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import { useState, useTransition } from "react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { facebookLogin, googleLogin } from "../actions";

export function SocialLoginButton() {
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [isFacebookPending, startFacebookTransition] = useTransition();
  const [activeProvider, setActiveProvider] = useState<
    null | "google" | "facebook"
  >(null);

  return (
    <div className="space-y-3">
      <EnhancedLoadingButton
        type="button"
        className="w-full gap-3"
        onClick={() => {
          setActiveProvider("google");
          startGoogleTransition(() => googleLogin());
        }}
        disabled={isGooglePending || isFacebookPending}
        loading={activeProvider === "google" && isGooglePending}
        action="admin"
        loadingText="Logging in with Google..."
      >
        <FcGoogle className="size-5" />
        <span>Continue with Google</span>
      </EnhancedLoadingButton>

      <EnhancedLoadingButton
        type="button"
        className="w-full gap-3"
        onClick={() => {
          setActiveProvider("facebook");
          startFacebookTransition(() => facebookLogin());
        }}
        disabled={isGooglePending || isFacebookPending}
        loading={activeProvider === "facebook" && isFacebookPending}
        action="admin"
        loadingText="Logging in with Facebook..."
      >
        <FaFacebook className="size-5 text-[#1877F2]" />
        <span>Continue with Facebook</span>
      </EnhancedLoadingButton>
    </div>
  );
}
