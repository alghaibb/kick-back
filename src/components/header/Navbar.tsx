"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { navLinks } from "@/lib/constants";
import { UserProvider } from "@/providers/UserContext";
import Link from "next/link";
import { UserDropdown } from "../UserDropdown";
import { Logo } from "./_components/Logo";
import MobileNav from "./MobileNav";

interface NavbarProps {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    nickname: string | null;
    image: string | null;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <UserProvider user={user}>
      <header className="w-full border-b border-border bg-background/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                size="sm"
                className="text-sm font-medium"
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <ModeToggle />

            {user ? (
              <div className="hidden sm:flex">
                <UserDropdown />
              </div>
            ) : (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="hidden sm:inline-flex"
              >
                <Link href="/create-account">Sign In</Link>
              </Button>
            )}

            {/* Mobile Nav */}
            <div className="sm:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </header>
    </UserProvider>
  );
}
