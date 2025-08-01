"use client";

import { useAuth } from "@/hooks/use-auth";
import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMobileScrollFix } from "@/hooks/use-mobile-scroll";
import { MainHeader } from "./MainHeader";
import { MainSidebar } from "./MainSidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FilterProvider } from "@/providers/FilterProvider";

interface MainLayoutClientProps {
  children: React.ReactNode;
}

export function MainLayoutClient({ children }: MainLayoutClientProps) {
  const { user } = useAuth();
  const { activeTheme } = useThemeConfig();
  const isMobile = useIsMobile();

  // Fix mobile scroll issues
  useMobileScrollFix();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!user) {
    return null;
  }

  const getThemeBackground = () => {
    // If user has a custom background, don't apply theme background
    if (user?.dashboardBackground) {
      return "bg-transparent";
    }

    // Otherwise use theme-based backgrounds
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

  const getCustomBackgroundStyle = () => {
    if (!user?.dashboardBackground) return {};

    return {
      backgroundImage: user.dashboardBackground.startsWith("linear-gradient")
        ? user.dashboardBackground
        : `url(${user.dashboardBackground})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    };
  };

  const toggleMobileSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-500 ease-in-out",
        getThemeBackground(),
        // Add a class when custom background is active for text styling
        user?.dashboardBackground && "custom-background-active"
      )}
      style={getCustomBackgroundStyle()}
    >
      {/* Smart overlay for custom backgrounds to ensure readability */}
      {user?.dashboardBackground && (
        <div
          className={cn(
            "absolute inset-0 transition-all duration-500",
            // Stronger overlay for images, lighter for gradients
            user.dashboardBackground.startsWith("linear-gradient")
              ? "bg-background/20 dark:bg-background/40"
              : "bg-background/50 dark:bg-background/60"
          )}
        />
      )}

      <div
        className={cn(
          "flex relative z-10",
          isMobile ? "mobile-layout" : "h-screen"
        )}
      >
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
                    "w-full h-full bg-card/95 backdrop-blur-sm transition-opacity duration-300",
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
              <div className="w-64 bg-card/95 backdrop-blur-sm border-r border-border">
                <MainSidebar isMobile={false} />
              </div>
            )}
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header with Toggle (only on mobile) - Hide when sidebar is open */}
          {(!isMobile || !mobileSidebarOpen) && (
            <MainHeader
              onToggleSidebar={isMobile ? toggleMobileSidebar : undefined}
              sidebarOpen={isMobile ? mobileSidebarOpen : true}
              showToggle={isMobile}
            />
          )}

          {/* Page Content */}
          <main
            className={cn(
              "flex-1 overflow-y-auto p-6",
              isMobile && "mobile-scroll-container"
            )}
          >
            <FilterProvider>
              <div className="mx-auto max-w-5xl">{children}</div>
            </FilterProvider>
          </main>
        </div>
      </div>
    </div>
  );
}
