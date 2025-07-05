import { Metadata } from 'next';
import MagicLinkLoginPage from './MagicLinkLoginPage';

export const metadata: Metadata = {
  title: 'Magic Link Login',
};

export default function Page() {
  return <MagicLinkLoginPage />;
}
