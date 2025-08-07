"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps {
  children: React.ReactNode;
}

export function SplashScreen({ children }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div className="text-center text-white">
          {/* Logo */}
          <div className="mx-auto mb-8 h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-pulse">
            <div className="h-12 w-12 rounded-full bg-white"></div>
          </div>

          {/* App Name */}
          <h1 className="mb-2 text-4xl font-bold text-white drop-shadow-lg">
            Kick Back
          </h1>

          {/* Tagline */}
          <p className="mb-8 text-lg text-white/90 font-light">Event Manager</p>

          {/* Loading Spinner */}
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-white/30 border-t-white"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
