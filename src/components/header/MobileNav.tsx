"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navLinks } from "@/lib/constants";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";

const UserInfo = dynamic(() => import("./_components/UserInfo"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-3 p-4 border-b">
      <Skeleton className="w-9 h-9 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2 w-16" />
      </div>
    </div>
  ),
});

const LogoutButton = dynamic(
  () => import("@/app/(auth)/(logout)/_components/LogoutButton"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-10" />,
  }
);

interface MobileNavProps {
  user: {
    nickname?: string | null;
    firstName?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export default function MobileNav({ user }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger className="sm:hidden p-2 rounded-md hover:bg-muted">
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
        </SheetHeader>

        {/* User Info */}
        {user && (
          <Suspense
            fallback={
              <div className="p-4 border-b text-sm text-muted-foreground">
                Loading...
              </div>
            }
          >
            <UserInfo
              firstName={user.firstName}
              nickname={user.nickname}
              email={user.email}
              image={user.image}
            />
          </Suspense>
        )}

        {/* Nav Links */}
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

        {/* Footer */}
        <div className="mt-auto p-4 border-t">
          {user ? (
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  Logging out...
                </div>
              }
            >
              <LogoutButton variant="outline" className="w-full" />
            </Suspense>
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
