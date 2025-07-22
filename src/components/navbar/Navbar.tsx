"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { navLinks } from "@/lib/constants";
import { useSession } from "@/providers/SessionProvider";
import Link from "next/link";
import { ThemeSelector } from "../ui/theme-selector";
import { UserDropdown } from "../UserDropdown";
import { Logo } from "../Logo";
import MobileNav from "./MobileNav";

export default function Navbar() {
  const { user, status } = useSession();

  return (
    <header className="w-full border-b border-border bg-background/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
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
          <ThemeSelector />

          <div className="hidden sm:block">
            {status === "loading" ? (
              <div className="w-8 h-8 animate-pulse bg-muted rounded-full"></div>
            ) : user ? (
              <div className="hidden sm:flex">
                <UserDropdown />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="hidden sm:inline-flex"
                >
                  <Link href="/login">Log In</Link>
                </Button>

                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/create-account">Create Account</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Nav */}
          <div className="sm:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
