"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { UserProvider } from "../../../providers/UserContext";
import { MainHeader } from "./MainHeader";
import { MainSidebar } from "./MainSidebar";
import { cn } from "@/lib/utils";

interface MainLayoutClientProps {
  children: React.ReactNode;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    nickname: string | null;
    image: string | null;
  };
}

export function MainLayoutClient({ children, user }: MainLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-zinc-50/50 dark:to-zinc-900/50">
      <div className="flex h-screen">
        {/* Sidebar - Hidden on mobile unless open */}
        {isHydrated && (
          <div
            className={cn(
              isMobile
                ? "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out"
                : "relative",
              isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0",
              "w-64"
            )}
          >
            <MainSidebar
              user={user}
              onClose={() => setSidebarOpen(false)}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <UserProvider user={user}>
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <MainHeader user={user} onMenuClick={() => setSidebarOpen(true)} />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-5xl">{children}</div>
            </main>
          </div>
        </UserProvider>
      </div>
    </div>
  );
}
