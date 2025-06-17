import { Metadata } from 'next';
import ForgotPasswordPage from './ForgotPasswordPage';

export const metadata: Metadata = {
  title: 'Forgot Password',
};

export default function Page() {
  return <ForgotPasswordPage />;
}
