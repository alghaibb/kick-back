import { SectionAnimationProvider } from "@/providers/SectionAnimationProvider";
import FeaturesHeader from "./_components/FeaturesHeader";
import FeaturesGrid from "./_components/FeaturesGrid";
import TechnicalFeatures from "./_components/TechnicalFeatures";
import FeaturesCTA from "./_components/FeaturesCTA";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
  description: "Discover the features of Kick Back",
};

export default function Page() {
  return (
    <SectionAnimationProvider>
      <FeaturesHeader />
      <FeaturesGrid />
      <TechnicalFeatures />
      <FeaturesCTA />
    </SectionAnimationProvider>
  );
}
