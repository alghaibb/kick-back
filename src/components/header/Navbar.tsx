import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { navLinks } from "@/lib/constants";
import Link from "next/link";
import { Logo } from "./_components/Logo";
import MobileNav from "./MobileNav";

interface NavbarProps {
  user: {
    nickname?: string | null;
    firstName?: string | null;
    email?: string | null;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const displayName = user?.nickname || user?.firstName || "Guest";

  return (
    <header className="w-full border-b border-border bg-background sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <ModeToggle />

          {/* Desktop User Info / Sign In */}
          {user ? (
            <div className="hidden sm:flex flex-col text-right text-sm">
              <span className="text-foreground font-medium">{displayName}</span>
              <span className="text-muted-foreground text-xs">
                {user.email}
              </span>
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

          {/* Mobile Nav only shown on small screens */}
          <div className="sm:hidden">
            <MobileNav user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
