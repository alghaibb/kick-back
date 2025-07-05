import { Metadata } from 'next';
import MagicLinkCreatePage from './MagicLinkCreatePage';

export const metadata: Metadata = {
  title: 'Magic Link - Create Account',
};

export default function Page() {
  return <MagicLinkCreatePage />;
}
