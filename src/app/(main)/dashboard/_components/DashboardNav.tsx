'use client';

import { Button } from '@/components/ui/button';
import { dashboardNavItems } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-2 lg:px-4">
      {dashboardNavItems.map((item) => {
        const isActive = pathname === item.url;

        return (
          <Button
            asChild
            key={item.title}
            variant="ghost"
            className={cn('justify-start gap-2 mt-2', isActive && 'bg-muted')}
          >
            <Link href={item.url}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
