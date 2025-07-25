"use client";

import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { useEffect, useState } from "react";
import { MainHeader } from "./MainHeader";
import { MainSidebar } from "./MainSidebar";

interface MainLayoutClientProps {
  children: React.ReactNode;
}

export function MainLayoutClient({ children }: MainLayoutClientProps) {
  const { user } = useAuth();
  const { activeTheme } = useThemeConfig();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  const toggleMobileSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    }
  };

  return (
    <div className={cn("min-h-screen", getThemeBackground())}>
      <div className="flex h-screen">
        {/* Sidebar - Always visible on desktop, collapsible on mobile */}
        {isHydrated && (
          <>
            {isMobile ? (
              // Mobile: Full width sidebar
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  mobileSidebarOpen ? "w-full" : "w-0"
                )}
              >
                <div
                  className={cn(
                    "w-full h-full bg-card transition-opacity duration-300",
                    mobileSidebarOpen ? "opacity-100" : "opacity-0"
                  )}
                >
                  <MainSidebar
                    isMobile={isMobile}
                    onNavigate={() => setMobileSidebarOpen(false)}
                  />
                </div>
              </div>
            ) : (
              // Desktop: Always visible sidebar
              <div className="w-64 bg-card border-r border-border">
                <MainSidebar isMobile={false} />
              </div>
            )}
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header with Toggle (only on mobile) */}
          <MainHeader
            onToggleSidebar={isMobile ? toggleMobileSidebar : undefined}
            sidebarOpen={isMobile ? mobileSidebarOpen : true}
            showToggle={isMobile}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
