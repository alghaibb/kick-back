"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/SessionProvider";
import { useEffect, useState } from "react";
import { MainHeader } from "./MainHeader";
import { MainSidebar } from "./MainSidebar";
import { useThemeConfig } from "@/providers/ActiveThemeProvider";

interface MainLayoutClientProps {
  children: React.ReactNode;
}

export function MainLayoutClient({ children }: MainLayoutClientProps) {
  const { user } = useSession();
  const { activeTheme } = useThemeConfig();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!user) {
    return null;
  }

   const getThemeBackground = () => {
    switch (activeTheme) {
      case "blue":
        return "bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/30";
      case "green":
        return "bg-gradient-to-br from-background via-background to-green-50/30 dark:to-green-950/30";
      case "amber":
        return "bg-gradient-to-br from-background via-background to-amber-50/30 dark:to-amber-950/30";
      default:
        return "bg-gradient-to-br from-background via-background to-muted/20";
    }
  };

  return (
    <div className={cn("min-h-screen", getThemeBackground())}>
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <MainHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
