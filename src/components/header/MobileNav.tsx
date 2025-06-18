'use client';

import LogoutButton from '@/app/(auth)/(logout)/_components/LogoutButton';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  hideHeaderNFooter,
  mobileNavFooterLinks,
  navItems,
} from '@/lib/constants';
import { User } from '@prisma/client';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../ui/theme-toggle';

export default function MobileNavbar({ user }: { user?: User }) {
  const pathname = usePathname();
  const cleanPathname = pathname.split('?')[0];

  const shouldHideNavbar = hideHeaderNFooter.some((route) =>
    cleanPathname.startsWith(route)
  );

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-left text-lg">
            {user ? `Welcome, ${user.nickname || user.firstName}` : ''}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-4 px-2">
          {navItems.map((item) => (
            <Button asChild variant="ghost" key={item.title}>
              <Link href={item.url}>{item.title}</Link>
            </Button>
          ))}
          {!user ? (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="dark:bg-secondary">
                <Link href="/create-account">Get Started</Link>
              </Button>
            </>
          ) : (
            <LogoutButton />
          )}
        </div>

        <SheetFooter className="flex flex-col items-start gap-2 border-t mt-6 px-0 text-muted-foreground">
          {mobileNavFooterLinks.map((link) => (
            <Button asChild variant="ghost" key={link.title} size="sm">
              <Link href={link.url} className="text-xs">
                {link.title}
              </Link>
            </Button>
          ))}
          <ThemeToggle />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
