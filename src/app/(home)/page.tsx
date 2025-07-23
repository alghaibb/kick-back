import CallToAction from "./_components/CallToAction";
import Content from "./_components/Content";
import Features from "./_components/Features";
import Hero from "./_components/Hero";
import { SectionAnimationProvider } from "@/providers/SectionAnimationProvider";

export default function Home() {
  return (
    <SectionAnimationProvider>
      <Hero />
      <Features />
      <Content />
      <CallToAction />
    </SectionAnimationProvider>
  );
}
