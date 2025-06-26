export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import GroupsPage from './GroupsPage';

export const metadata: Metadata = {
  title: 'Groups',
  description: 'Manage your groups here.',
};

export default function Page() {
  return <GroupsPage />;
}
