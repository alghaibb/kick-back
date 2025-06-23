import { ThemeToggle } from '@/components/ui/theme-toggle';
import UserDropdown from '@/components/UserDropdown';
import prisma from '@/lib/prisma';
import { getSession } from '@/utils/sessions';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import DashboardMobileNav from './_components/DashboardMobileNav';
import DashboardNav from './_components/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nickname: true,
      firstName: true,
      image: true,
      hasOnboarded: true,
    },
  });

  if (!user) {
    throw new Error('Unauthorized');
  }
  
  if (!user.hasOnboarded) redirect('/onboarding');

  return (
    <div className="min-h-screen w-full grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden md:block border-r bg-muted/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="logo"
                width={150}
                height={150}
                className="dark:invert"
              />
            </Link>
          </div>

          <div className="flex-1">
            <DashboardNav />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <DashboardMobileNav />

          <div className="ml-auto items-center gap-x-1 flex">
            <ThemeToggle />
            <UserDropdown
              name={user?.nickname || user?.firstName}
              image={user?.image}
            />
          </div>
        </header>
      </div>
    </div>
  );
}
