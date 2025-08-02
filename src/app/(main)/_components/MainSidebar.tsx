"use client";

import LogoutButton from "@/app/(auth)/(logout)/_components/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LogOut,
  PanelLeftClose,
  Shield,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, adminNavigation } from "./constants";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MainSidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function MainSidebar({ isMobile, onNavigate }: MainSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const getInitials = () => {
    const firstName = user.firstName || "";
    const nickname = user.nickname || "";
    return (firstName[0] || nickname[0] || "U").toUpperCase();
  };

  const handleNavClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  const handleClose = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      {/* Header with Logo and Close Button */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={handleNavClick}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                KB
              </span>
            </div>
            <span className="font-bold text-xl">Kick Back</span>
          </Link>

          {/* Close Button - Only on mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-10 w-10"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Theme Controls - Only on mobile */}
      {isMobile && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-center gap-4">
            <ModeToggle />
            <ThemeSelector />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              <Link href={item.href} onClick={handleNavClick}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          );
        })}

        {/* Admin Navigation - Only show for admin users */}
        {user.role === "ADMIN" && (
          <>
            <div className="pt-4 pb-2">
              <div className="h-px bg-border" />
            </div>

            {/* Admin Panel Collapsible Section */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between group"
                >
                  <div className="flex items-center">
                    <Shield className="mr-3 h-4 w-4" />
                    Admin Panel
                  </div>
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:hidden" />
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]:hidden" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="ml-4 space-y-1">
                {adminNavigation.slice(1).map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Button
                      key={item.name}
                      asChild
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Link href={item.href} onClick={handleNavClick}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image ?? undefined} alt="Profile" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                {user.nickname || user.firstName}
              </p>
              {/* Admin Badge - Only show for admin users */}
              {user.role === "ADMIN" && (
                <Badge
                  variant="secondary"
                  className="text-xs flex-shrink-0 px-1.5 py-0.5"
                >
                  <Shield className="h-2.5 w-2.5 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>

        <LogoutButton
          variant="ghost"
          className="w-full justify-start flex items-center gap-3"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </LogoutButton>
      </div>
    </div>
  );
}
