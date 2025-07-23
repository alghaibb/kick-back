"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  nickname: string | null;
  image: string | null;
}

interface SessionContextType {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  fetchUser: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  status: "loading",
  fetchUser: async () => {},
});

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        // Add caching headers
        cache: "no-store",
        next: { revalidate: 0 },
      });

      if (response.ok) {
        const userData = await response.json();
        setStatus("authenticated");
        setUser(userData);
      } else {
        setStatus("unauthenticated");
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user session:", error);
      setStatus("unauthenticated");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <SessionContext.Provider value={{ user, status, fetchUser }}>
      {children}
    </SessionContext.Provider>
  );
}
