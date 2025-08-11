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
        className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-zinc-50 transition-opacity duration-300 ease-out motion-reduce:transition-none ${isExiting ? "opacity-0" : "opacity-100"}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {/* Aurora conic gradients (slow, subtle movement) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div className="h-[46rem] w-[46rem] rounded-full blur-3xl opacity-25 animate-spin [animation-duration:35s] ease-linear bg-[conic-gradient(from_0deg,rgba(103,61,230,0.6)_0deg,rgba(56,189,248,0.5)_120deg,rgba(103,61,230,0.6)_240deg,rgba(56,189,248,0.5)_360deg)] motion-reduce:animate-none" />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div className="h-[36rem] w-[36rem] rounded-full blur-3xl opacity-20 animate-spin [animation-duration:45s] ease-linear bg-[conic-gradient(from_90deg,rgba(56,189,248,0.6)_0deg,rgba(103,61,230,0.5)_180deg,rgba(56,189,248,0.6)_360deg)] motion-reduce:animate-none" />
        </div>

        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-[28rem] w-[28rem] rounded-full blur-3xl opacity-90 bg-[radial-gradient(circle_at_center,rgba(103,61,230,0.25)_0%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0)_75%)]" />
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
          {/* Gradient ring spinner */}
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.25)] bg-[conic-gradient(at_50%_50%,#a78bfa_0deg,#38bdf8_120deg,#a78bfa_240deg,#38bdf8_360deg)] animate-spin [animation-duration:1600ms] motion-reduce:animate-none" />
            <div className="absolute inset-[6px] rounded-full bg-zinc-950" />
          </div>
          <span className="sr-only">Loading Kick Back</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
