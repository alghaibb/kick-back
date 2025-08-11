"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

interface SplashScreenProps {
  children: React.ReactNode;
}

export function SplashScreen({ children }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple 1.5 second splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background dark:bg-foreground">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Kick Back Logo"
            width={256}
            height={256}
            className="mb-6"
            priority
          />
          <Spinner size="xxl" stroke={false} className="text-background" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
