export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import OnboardingPage from './OnboardingPage';

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Welcome to the onboarding page!',
};

export default function Page() {
  return <OnboardingPage />;
}
