import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { getSession } from '@/utils/sessions';
import GroupsClient from './GroupsClient';

export default async function GroupsPage() {
  const session = await getSession();

  const groups = await prisma.group.findMany({
    where: { ownerId: session?.user?.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-6xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Your Groups</CardTitle>
          <CardDescription>
            View and manage your groups or create new ones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GroupsClient groups={groups} />
        </CardContent>
      </Card>
    </div>
  );
}
