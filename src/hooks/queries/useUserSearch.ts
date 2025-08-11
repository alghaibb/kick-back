"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounced-search";

export interface UserSuggestion {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  image: string | null;
}

export function useUserSearch() {
  const {
    value: query,
    debouncedValue,
    setValue: setQuery,
  } = useDebounce("", 300);
  const [results, setResults] = useState<UserSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const q = debouncedValue.trim();
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ q, limit: "8" });
        const res = await fetch(`/api/users/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setResults([]);
          setIsLoading(false);
          return;
        }
        const data: { users: UserSuggestion[] } = await res.json();
        setResults(data.users || []);
      } catch (error: unknown) {
        const err = error as { name?: string };
        if (err?.name === "AbortError") {
          return;
        }
        console.error("User search fetch error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [debouncedValue]);

  return { query, setQuery, results, isLoading };
}
