"use client";

import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { callToActionData } from "@/lib/constants";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function FeaturesCTA() {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { unlocked, unlockNext } = useSectionAnimation();
  const myIndex = 3;
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (isInView && unlocked >= myIndex && !hasTriggered) {
      controls.start("visible");
      setHasTriggered(true);
      setTimeout(unlockNext, 300);
    }
  }, [isInView, unlocked, controls, unlockNext, hasTriggered]);

  return (
    <section className="py-16 md:py-32" ref={ref}>
      <motion.div
        className="mx-auto max-w-4xl px-6 text-center"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <TextEffect
          per="word"
          as="h2"
          className="text-balance text-4xl font-semibold lg:text-5xl text-foreground mb-6"
          preset="fade-in-blur"
          trigger={hasTriggered}
          speedReveal={2}
        >
          {callToActionData.title.split(" ").map((word, index) =>
            word === "Started" ? (
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
          className="text-lg text-muted-foreground mb-8"
          preset="fade-in-blur"
          delay={0.2}
          trigger={hasTriggered}
          speedReveal={2}
        >
          {callToActionData.description}
        </TextEffect>

        <motion.div
          className="flex gap-4 justify-center flex-wrap"
          variants={itemVariants}
        >
          <Button asChild size="lg" className="text-lg px-8">
            <Link href={callToActionData.primaryButton.href}>
              {callToActionData.primaryButton.text}
              <callToActionData.primaryButton.icon className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href={callToActionData.secondaryButton.href}>
              {callToActionData.secondaryButton.text}
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
