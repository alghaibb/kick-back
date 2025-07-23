"use client";

import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CallToAction() {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { unlocked, unlockNext } = useSectionAnimation();
  const myIndex = 3;
  const { activeTheme } = useThemeConfig();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (isInView && unlocked >= myIndex && !hasTriggered) {
      controls.start("visible");
      setHasTriggered(true);
      setTimeout(unlockNext, 300);
    }
  }, [isInView, unlocked, controls, unlockNext, hasTriggered]);

  return (
    <section className={`py-16 md:py-32 theme-${activeTheme}`} ref={ref}>
      <motion.div
        className="mx-auto max-w-5xl px-6 text-center"
        initial="hidden"
        animate={isInView && unlocked >= myIndex ? controls : "hidden"}
        variants={containerVariants}
      >
        <TextEffect
          per="word"
          as="h2"
          className="text-balance text-4xl font-semibold lg:text-5xl"
          preset="fade-in-blur"
          trigger={hasTriggered}
          speedReveal={2}
        >
          Ready to make event planning{" "}
          <span className="text-primary font-bold">effortless</span>?
        </TextEffect>

        <TextEffect
          per="word"
          as="p"
          className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto"
          preset="fade-in-blur"
          delay={0.3}
          trigger={hasTriggered}
          speedReveal={2}
        >
          Join your{" "}
          <span className="font-bold text-primary">family and friends</span> in
          creating{" "}
          <span className="font-bold text-primary">unforgettable moments</span>.
          Start planning today with easy-to-use tools designed just for you.
        </TextEffect>

        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-4"
          variants={itemVariants}
        >
          <Button asChild size="lg">
            <Link href="/create-account">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/features">Learn More</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
