import { Metadata } from "next";
import HelpHeader from "./_components/HelpHeader";
import GettingStarted from "./_components/GettingStarted";
import ManagingEvents from "./_components/ManagingEvents";
import PhotoSharing from "./_components/PhotoSharing";
import MobileExperience from "./_components/MobileExperience";
import Troubleshooting from "./_components/Troubleshooting";
import PrivacySecurity from "./_components/PrivacySecurity";

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Get help with Kick Back. Find answers to common questions and learn how to use all features.",
};

export default function Page() {
  return (
    <div className="relative pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <HelpHeader />

        <div className="space-y-8">
          <GettingStarted />
          <ManagingEvents />
          <PhotoSharing />
          <MobileExperience />
          <Troubleshooting />
          <PrivacySecurity />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Contact us through
            your dashboard settings.
          </p>
        </div>
      </div>
    </div>
  );
}
