"use client";

import LogoutButton from "@/app/(auth)/(logout)/_components/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/SessionProvider";
import { LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "./constants";

interface MainSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export function MainSidebar({ onClose, isMobile }: MainSidebarProps) {
  const { user } = useSession();
  const pathname = usePathname();

  if (!user) return null;

  const getInitials = () => {
    const firstName = user.firstName || "";
    const nickname = user.nickname || "";
    return (firstName[0] || nickname[0] || "U").toUpperCase();
  };

  const handleNavigation = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              KB
            </span>
          </div>
          <span className="font-bold text-xl">Kick Back</span>
        </Link>

        {/* Close button for mobile */}
        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col space-y-4">
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
              <Link href={item.href} onClick={handleNavigation}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image ?? undefined} alt="Profile" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.nickname || user.firstName}
            </p>
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
