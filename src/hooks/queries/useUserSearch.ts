"use client";

import { useDebounce } from "@/hooks/use-debounced-search";
import { useQuery } from "@tanstack/react-query";

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
  const { data, isFetching } = useQuery({
    queryKey: ["user-search", debouncedValue],
    queryFn: async ({ signal }) => {
      const q = debouncedValue.trim();
      if (q.length < 2) return { users: [] as UserSuggestion[] };
      const params = new URLSearchParams({ q, limit: "8", excludeSelf: "1" });
      const res = await fetch(`/api/users/search?${params.toString()}`, {
        signal,
      });
      if (!res.ok) return { users: [] as UserSuggestion[] };
      const payload: { users: UserSuggestion[] } = await res.json();
      return payload;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  return { query, setQuery, results: data?.users ?? [], isLoading: isFetching };
}
