import { Metadata } from 'next';
import CreateAccountPage from './CreateAccountPage';

export const metadata: Metadata = {
  title: 'Create Account',
};

export default function Page() {
  return <CreateAccountPage />;
}
