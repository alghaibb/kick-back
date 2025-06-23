import { Button } from '@/components/ui/button';
import { navItems } from '@/lib/constants';
import { User } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '../ui/theme-toggle';
import UserDropdown from '../UserDropdown';
import MobileNavbar from './MobileNav';

export default function Navbar({ user }: { user?: User }) {
  return (
    <nav className="flex items-center justify-between w-full">
      <div className="flex flex-1 justify-start">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="KickBack Logo"
            width={165}
            height={165}
            className="dark:invert"
          />
        </Link>
      </div>

      <div className="hidden lg:flex flex-1 justify-center gap-4">
        {navItems.map((item) => (
          <Button asChild variant="ghost" key={item.title}>
            <Link href={item.url}>{item.title}</Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-1 justify-end gap-2">
        <div className="hidden lg:flex gap-2">
          {!user ? (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="dark:bg-secondary">
                <Link href="/create-account">Get Started</Link>
              </Button>
              <ThemeToggle />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserDropdown name={user.firstName} image={user.image} />
            </div>
          )}
        </div>

        <div className="lg:hidden">
          <MobileNavbar user={user} />
        </div>
      </div>
    </nav>
  );
}
