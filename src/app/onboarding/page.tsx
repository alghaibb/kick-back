export const dynamic = "force-dynamic";

import { Metadata } from "next";
import OnboardingPage from "./OnboardingPage";

export const metadata: Metadata = {
  title: "Complete Your Profile | Kick Back",
  description:
    "Finish setting up your profile to start planning events with friends and family.",
  keywords: ["onboarding", "profile setup", "event planning", "social events"],
};

export default function Page() {
  return <OnboardingPage />;
}
