"use client";

import LogoutButton from "@/app/(auth)/(logout)/_components/LogoutButton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navLinks } from "@/lib/constants";
import { useUser } from "@/providers/UserContext";
import { Menu } from "lucide-react";
import Link from "next/link";
import UserInfo from "./_components/UserInfo";

export default function MobileNav() {
  const user = useUser();

  return (
    <Sheet>
      <SheetTrigger className="sm:hidden p-2 rounded-md hover:bg-muted">
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
        </SheetHeader>

        {user && (
          <div className="px-4">
            <UserInfo
              firstName={user.firstName}
              nickname={user.nickname}
              email={user.email}
              image={user.image}
            />
          </div>
        )}

        <nav className="flex flex-col gap-4 p-4">
          {navLinks.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t">
          {user ? (
            <LogoutButton variant="outline" className="w-full" />
          ) : (
            <SheetClose asChild>
              <Link
                href="/login"
                className="text-sm font-medium block w-full text-left text-primary"
              >
                Log In
              </Link>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
