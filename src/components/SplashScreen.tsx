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
        className={`fixed inset-0 z-50 flex items-center justify-center bg-foreground text-background transition-opacity duration-300 ease-out motion-reduce:transition-none ${isExiting ? "opacity-0" : "opacity-100"}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(255,255,255,0)_60%)] blur-3xl" />
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
            className="text-background motion-reduce:animate-none"
          />
          <span className="sr-only">Loading Kick Back</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
