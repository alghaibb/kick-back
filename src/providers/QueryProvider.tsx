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
            staleTime: 5 * 60 * 1000, 
            gcTime: 15 * 60 * 1000, 
            retry: (failureCount, error) => {
              if (error?.message === "UNAUTHORIZED") {
                return false;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false, 
            refetchOnReconnect: true,
          },
          mutations: {
            retry: (failureCount, error) => {
              if (error?.message === "UNAUTHORIZED") {
                return false;
              }
              return failureCount < 2;
            },
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
