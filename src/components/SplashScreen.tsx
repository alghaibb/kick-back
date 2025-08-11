"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

interface SplashScreenProps {
  children: React.ReactNode;
}

export function SplashScreen({ children }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsExiting(true), 1200);
    const hideTimer = setTimeout(() => setIsLoading(false), 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-zinc-50 transition-opacity duration-300 ease-out motion-reduce:transition-none ${isExiting ? "opacity-0" : "opacity-100"}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-[24rem] w-[24rem] rounded-full blur-3xl opacity-70 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.06)_45%,rgba(255,255,255,0)_75%)]" />
        </div>
        <div className="relative text-center">
          <Image
            src="/logo.png"
            alt="Kick Back Logo"
            width={256}
            height={256}
            className="mb-6 select-none invert"
            priority
          />
          <Spinner
            size="xxl"
            stroke={false}
            className="text-zinc-50 motion-reduce:animate-none"
          />
          <span className="sr-only">Loading Kick Back</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
