"use client";

import { LoadingButton } from "@/components/ui/button";
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
      <LoadingButton
        type="button"
        className="w-full gap-3"
        onClick={() => {
          setActiveProvider("google");
          startGoogleTransition(() => googleLogin());
        }}
        disabled={isGooglePending || isFacebookPending}
        loading={activeProvider === "google" && isGooglePending}
      >
        <FcGoogle className="size-5" />
        <span>
          {isGooglePending && activeProvider === "google"
            ? "Logging in with Google..."
            : "Continue with Google"}
        </span>
      </LoadingButton>

      <LoadingButton
        type="button"
        className="w-full gap-3"
        onClick={() => {
          setActiveProvider("facebook");
          startFacebookTransition(() => facebookLogin());
        }}
        disabled={isGooglePending || isFacebookPending}
        loading={activeProvider === "facebook" && isFacebookPending}
      >
        <FaFacebook className="size-5 text-[#1877F2]" />
        <span>
          {isFacebookPending && activeProvider === "facebook"
            ? "Logging in with Facebook..."
            : "Continue with Facebook"}
        </span>
      </LoadingButton>
    </div>
  );
}
