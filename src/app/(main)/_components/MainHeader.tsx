"use client";

import LogoutButton from "@/app/(auth)/(logout)/_components/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { navigation } from "./constants";

interface MainHeaderProps {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    nickname: string | null;
    image: string | null;
  };
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export function MainHeader({ onMenuClick }: MainHeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-8">
      <div className="flex items-center justify-between">
        {/* Left: Logo (mobile only) */}
        <div className="flex-1">
          <Link href="/" className="flex items-center space-x-2 md:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                KB
              </span>
            </div>
            <span className="font-bold text-xl text-foreground">Kick Back</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navigation.map((item) => (
                <DropdownMenuItem asChild key={item.name}>
                  <Link href={item.href}>{item.name}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <LogoutButton
                  variant="ghost"
                  className="w-full justify-start flex items-center gap-3"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </LogoutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
