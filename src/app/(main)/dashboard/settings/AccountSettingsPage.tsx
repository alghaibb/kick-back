import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { getSession } from '@/utils/sessions';
import AccountSettingsForm from './AccountSettingsForm';

export default async function AccountSettingsPage() {
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
  });

  if (!user) throw new Error('Uauthorized');

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-7xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Account Settings</CardTitle>
          <CardDescription>
            Update your profile information below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettingsForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
