"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { learnMoreData } from "@/lib/constants";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function LearnMoreHeader() {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { unlocked, unlockNext } = useSectionAnimation();
  const myIndex = 0;
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (isInView && unlocked >= myIndex && !hasTriggered) {
      controls.start("visible");
      setHasTriggered(true);
      setTimeout(unlockNext, 300);
    }
  }, [isInView, unlocked, controls, unlockNext, hasTriggered]);

  return (
    <section className="pt-24 pb-16" ref={ref}>
      <motion.div
        className="mx-auto max-w-5xl px-6"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <div className="text-center">
          <motion.div variants={itemVariants}>
            <Badge variant="secondary" className="mb-4">
              {learnMoreData.hero.badge}
            </Badge>
          </motion.div>

          <TextEffect
            per="word"
            as="h1"
            className="text-balance text-4xl font-semibold lg:text-6xl text-foreground mb-6"
            preset="fade-in-blur"
            trigger={hasTriggered}
            speedReveal={2}
          >
            {learnMoreData.hero.title.split(" ").map((word, index) =>
              word === "Complete" ? (
                <span key={index} className="text-primary font-bold">
                  {" "}
                  {word}
                </span>
              ) : (
                <span key={index}> {word}</span>
              )
            )}
          </TextEffect>

          <TextEffect
            per="word"
            as="p"
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
            preset="fade-in-blur"
            delay={0.3}
            trigger={hasTriggered}
            speedReveal={2}
          >
            {learnMoreData.hero.description}
          </TextEffect>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            variants={itemVariants}
          >
            <Button asChild size="lg">
              <Link href={learnMoreData.hero.primaryButton.href}>
                {learnMoreData.hero.primaryButton.text}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={learnMoreData.hero.secondaryButton.href}>
                {learnMoreData.hero.secondaryButton.text}
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
