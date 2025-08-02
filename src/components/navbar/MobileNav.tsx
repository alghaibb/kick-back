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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { navLinks, footerLinks } from "@/lib/constants";
import { adminNavigation } from "@/app/(main)/_components/constants";
import { Menu, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { memo, useState } from "react";
import UserInfo from "./_components/UserInfo";

function MobileNav() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Only render on mobile devices
  if (!isMobile) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 hover:bg-muted/50"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[300px] flex flex-col p-0 overflow-hidden"
      >
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
        <nav className="flex-1 px-6 py-4 overflow-y-auto">
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

          {/* Admin Navigation Links - Only show for admin users */}
          {user?.role === "ADMIN" && (
            <>
              <Separator className="my-4" />
              <Collapsible
                open={isAdminOpen}
                onOpenChange={setIsAdminOpen}
                className="space-y-1"
              >
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground group">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Admin Panel
                    </span>
                    <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:hidden" />
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]:hidden" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1">
                  <div className="space-y-1 pl-2">
                    {adminNavigation
                      .filter((link) => link.href) // Only show links with href
                      .map((link) => {
                        const Icon = link.icon;
                        return (
                          <SheetClose asChild key={link.href}>
                            <Link
                              href={link.href}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                            >
                              <Icon className="h-4 w-4" />
                              <span>{link.name}</span>
                            </Link>
                          </SheetClose>
                        );
                      })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </nav>

        <Separator />

        {/* Footer Links */}
        <div className="px-6 py-3">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            {footerLinks
              .filter((link) => !link.requiresAuth || isAuthenticated)
              .map((link) => {
                const Icon = link.icon;
                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-foreground transition-colors text-left flex items-center gap-2"
                    >
                      <Icon className="h-3 w-3 flex-shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
          </div>
        </div>

        <Separator className="mx-6" />

        {/* Authentication Section */}
        <div className="p-6 pt-4">
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
