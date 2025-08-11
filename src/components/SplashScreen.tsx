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
    // 1.2s show, 300ms fade-out
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
        className={`fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground dark:bg-foreground dark:text-background transition-opacity duration-300 ease-out motion-reduce:transition-none ${isExiting ? "opacity-0" : "opacity-100"}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Light mode glow (stronger + blend for visibility) */}
          <div className="dark:hidden h-[28rem] w-[28rem] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.06)_50%,rgba(0,0,0,0)_75%)] opacity-80 mix-blend-multiply" />
          {/* Dark mode glow (subtle light) */}
          <div className="hidden dark:block h-80 w-80 rounded-full blur-3xl bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),rgba(255,255,255,0)_60%)]" />
        </div>

        <div className="relative text-center">
          <Image
            src="/logo.png"
            alt="Kick Back Logo"
            width={256}
            height={256}
            className="mb-6 select-none"
            priority
          />
          <Spinner
            size="xxl"
            stroke={false}
            className="text-foreground dark:text-background motion-reduce:animate-none"
          />
          <span className="sr-only">Loading Kick Back</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
