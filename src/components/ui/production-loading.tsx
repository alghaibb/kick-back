"use client";

import { useEffect, useState } from "react";

interface ProductionLoadingProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  minDelay?: number; // Minimum time to show loading state (in ms)
}

/**
 * A component that ensures loading states are visible for a minimum duration
 * This is particularly useful in production where server components render quickly
 */
export function ProductionLoading({ 
  children, 
  fallback, 
  minDelay = 300 
}: ProductionLoadingProps) {
  const [showLoading, setShowLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    // Set content as ready immediately
    setContentReady(true);

    // Show loading for minimum delay
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, minDelay);

    return () => clearTimeout(timer);
  }, [minDelay]);

  if (showLoading && !contentReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
