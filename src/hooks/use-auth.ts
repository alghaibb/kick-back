import { useSession } from "@/providers/SessionProvider";
import { useMemo } from "react";

export function useAuth() {
  const { user, status } = useSession();

  const authState = useMemo(() => ({
    user,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" && !!user,
    isUnauthenticated: status === "unauthenticated",
  }), [user, status]);

  // Memoize the entire hook return to prevent object recreation
  return useMemo(() => authState, [authState]);
} 