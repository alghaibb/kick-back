export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import AccountSettingsPage from './AccountSettingsPage';

export const metadata: Metadata = {
  title: 'Dashboard - Settings',
  description: 'Update your account settings and preferences.',
};

export default function Page() {
  return <AccountSettingsPage />;
}
