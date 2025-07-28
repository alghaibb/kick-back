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
            // Ultra-fast settings for small user base (0-100 users)
            staleTime: 5 * 1000, // 5 seconds - very fresh data (increased from 2 seconds)
            gcTime: 5 * 60 * 1000, // 5 minutes - reasonable cache time
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
            refetchIntervalInBackground: true,
          },
          mutations: {
            // Faster retry for mutations
            retry: 1,
            // Don't show loading states for too long
            gcTime: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
