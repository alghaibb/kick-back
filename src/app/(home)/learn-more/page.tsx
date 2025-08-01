import { SectionAnimationProvider } from "@/providers/SectionAnimationProvider";
import LearnMoreHeader from "./_components/LearnMoreHeader";
import HowItWorks from "./_components/HowItWorks";
import Benefits from "./_components/Benefits";
import LearnMoreCTA from "./_components/LearnMoreCTA";

export default function Page() {
  return (
    <SectionAnimationProvider>
      <LearnMoreHeader />
      <HowItWorks />
      <Benefits />
      <LearnMoreCTA />
    </SectionAnimationProvider>
  );
}
