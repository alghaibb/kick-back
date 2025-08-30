"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
  [key: string]: string | number; // Allow additional custom filters
}

interface FilterContextType {
  filters: FilterState;
  updateFilter: (key: string, value: string | number) => void;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  clearSearch: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  defaultFilters?: Partial<FilterState>;
  basePath?: string;
}

export function FilterProvider({
  children,
  defaultFilters = {},
  basePath = "",
}: FilterProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 20,
    ...defaultFilters,
  });

  // Sync with URL params on mount and URL changes
  useEffect(() => {
    const urlFilters: Partial<FilterState> = {};

    // Parse URL search params
    for (const [key, value] of searchParams.entries()) {
      if (key === "page" || key === "limit") {
        urlFilters[key] = parseInt(value) || defaultFilters[key] || 1;
      } else if (key === "sortOrder") {
        urlFilters[key] = (value as "asc" | "desc") || "desc";
      } else {
        urlFilters[key] = value;
      }
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      setFilters(
        (prev) =>
          ({
            ...prev,
            ...urlFilters,
          }) as FilterState
      );
    }
  }, [searchParams, defaultFilters]);

  const updateURL = (newFilters: Partial<FilterState>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset page to 1 when filters change (except for page itself)
    if (Object.keys(newFilters).some((key) => key !== "page")) {
      params.set("page", "1");
    }

    const newURL = `${basePath}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  };

  const updateFilter = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    updateURL({ [key]: value });
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }) as FilterState);
    updateURL(updates);
  };

  const resetFilters = () => {
    const resetFilters: FilterState = {
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 20,
      ...defaultFilters,
    };
    setFilters(resetFilters);
    updateURL(resetFilters);
  };

  const clearSearch = () => {
    updateFilter("search", "");
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilter,
        updateFilters,
        resetFilters,
        clearSearch,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
