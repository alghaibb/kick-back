import { getSession } from '@/utils/sessions';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen w-full px-4 py-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto w-full">{children}</div>
    </main>
  );
}
