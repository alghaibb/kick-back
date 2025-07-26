"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useAuth } from "@/hooks/use-auth";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MainHeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  showToggle?: boolean;
}

export function MainHeader({
  onToggleSidebar,
  sidebarOpen,
  showToggle,
}: MainHeaderProps) {
  const { user } = useAuth();

  if (!user) return null;

  const handleToggleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const handleLogoClick = () => {
    console.log("Logo clicked - this should navigate");
  };

  return (
    <header
      className={cn(
        "bg-card/90 backdrop-blur-md border-b border-border py-5 sm:py-5 sticky top-0 z-40 shadow-sm",
        showToggle && sidebarOpen ? "px-4" : "px-6"
      )}
    >
      <div className="relative flex items-center justify-between h-10">
        {/* Left: Toggle Button */}
        <div className="flex items-center h-full flex-shrink-0">
          {showToggle && (
            <div className="relative z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleClick}
                className="h-10 w-10"
                type="button"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeftOpen className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Center: Logo - Absolutely centered */}
        {showToggle && !sidebarOpen && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  KB
                </span>
              </div>
              <span className="font-bold text-xl text-foreground whitespace-nowrap">
                Kick Back
              </span>
            </Link>
          </div>
        )}

        {/* Right: Theme Controls - Only on desktop */}
        {!showToggle && (
          <div className="flex items-center gap-3 h-full flex-shrink-0">
            <ModeToggle />
            <ThemeSelector />
          </div>
        )}
      </div>
    </header>
  );
}
