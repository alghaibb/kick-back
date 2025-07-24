"use client";

import { useQueryClient } from "@tanstack/react-query";

export function useDashboardInvalidation() {
  const queryClient = useQueryClient();

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
  };

  return {
    invalidateDashboard,
  };
} 