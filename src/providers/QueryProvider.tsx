"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimized caching strategy for performance
            staleTime: 2 * 60 * 1000, // 2 minutes - balance between freshness and performance
            gcTime: 10 * 60 * 1000, // 10 minutes - longer cache retention for better UX
            retry: (failureCount, error) => {
              // Don't retry auth errors
              if (error?.message === "UNAUTHORIZED") {
                return false;
              }
              // Only retry once for other errors
              return failureCount < 1;
            },
            refetchOnWindowFocus: true, // Re-enable for instant updates when switching tabs
            refetchOnReconnect: true,
            // Enable background refetching for real-time feel
            refetchIntervalInBackground: false, // Disable to save resources when tab is inactive
            // Network mode optimizations
            networkMode: "online",
            // Reduce memory usage
            structuralSharing: true, // Share identical data structures
          },
          mutations: {
            // Faster retry for mutations
            retry: 1,
            // Longer garbage collection for mutations (better UX on slow networks)
            gcTime: 5 * 60 * 1000, // 5 minutes instead of 1 second
            // Network optimizations
            networkMode: "online",
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only load devtools in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
