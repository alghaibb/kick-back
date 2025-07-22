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
import { useIsMobile } from "@/hooks/use-mobile";
import { navLinks } from "@/lib/constants";
import { useSession } from "@/providers/SessionProvider";
import { Menu } from "lucide-react";
import Link from "next/link";
import UserInfo from "./_components/UserInfo";

export default function MobileNav() {
  const { user } = useSession();
  const isMobile = useIsMobile();

  return (
    <Sheet key={`mobile-nav-${isMobile}`}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden h-9 w-9 hover:bg-muted/50"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-start">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>

        {/* User Section */}
        {user && (
          <>
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
          </>
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

        {/* Bottom Section */}
        <div className="p-6 pt-0">
          {user ? (
            <LogoutButton
              className="w-full h-10 font-medium"
            />
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
