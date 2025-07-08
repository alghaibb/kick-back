"use client";

import { useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { navigation } from "./constants";
import { ModeToggle } from "@/components/ui/mode-toggle";
import Link from "next/link";

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

export function MainHeader({ user, onMenuClick, isMobile }: MainHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-card border-b border-border px-6 py-5">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          {/* Desktop Search */}
          <div className="relative flex-1 hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search events, friends..." className="pl-10" />
          </div>

          {/* Mobile Search Modal */}
          <ResponsiveModal>
            <ResponsiveModalTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>
            </ResponsiveModalTrigger>
            <ResponsiveModalContent>
              <ResponsiveModalHeader>
                <ResponsiveModalTitle className="mb-4">
                  Search
                </ResponsiveModalTitle>
              </ResponsiveModalHeader>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search events, groups..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full">
                  Search
                </Button>
              </form>
            </ResponsiveModalContent>
          </ResponsiveModal>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <ModeToggle />

          {/* Mobile menu */}
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
