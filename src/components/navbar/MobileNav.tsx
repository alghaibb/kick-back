"use client";

import LogoutButton from "@/app/(auth)/(logout)/_components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { navLinks } from "@/lib/constants";
import { Menu } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import UserInfo from "./_components/UserInfo";

function MobileNav() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  // Only render on mobile devices
  if (!isMobile) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-muted/50"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] flex flex-col p-0">
        <SheetHeader className="flex flex-row items-center justify-start">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>

        {/* User Section */}
        {user && (
          <div className="px-6 pb-4">
            <div className="rounded-lg bg-muted/30 p-4">
              <UserInfo
                firstName={user.firstName}
                nickname={user.nickname}
                email={user.email}
                image={user.image}
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Navigation Links */}
        <nav className="flex-1 px-6 py-4">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                  <span>{link.label}</span>
                </Link>
              </SheetClose>
            ))}
          </div>
        </nav>

        <Separator />

        {/* Authentication Section */}
        <div className="p-6 pt-0">
          {isLoading ? (
            <div className="w-full h-10 animate-pulse bg-muted rounded"></div>
          ) : isAuthenticated ? (
            <LogoutButton className="w-full h-10 font-medium" />
          ) : (
            <div className="space-y-2">
              <SheetClose asChild>
                <Button asChild variant="outline" className="w-full h-10">
                  <Link href="/login">Log In</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="w-full h-10">
                  <Link href="/create-account">Create Account</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default memo(MobileNav);
