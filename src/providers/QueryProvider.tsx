"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default for frequently changing data (comments, RSVPs)
            staleTime: 2 * 60 * 1000, // 2 minutes (was 5)
            gcTime: 10 * 60 * 1000, // Keep 10 minutes
            retry: 2, // Increase retry from 1 to 2
            refetchOnWindowFocus: true,
            refetchOnReconnect: true, // Enable reconnect refetch
          },
          mutations: {
            retry: 2, // Increase retry from 1 to 2
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
