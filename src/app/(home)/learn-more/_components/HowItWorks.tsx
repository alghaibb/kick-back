"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { learnMoreData } from "@/lib/constants";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function HowItWorks() {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { unlocked, unlockNext } = useSectionAnimation();
  const myIndex = 1;
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
        className="mx-auto max-w-6xl px-6"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <div className="text-center mb-16">
          <TextEffect
            per="word"
            as="h2"
            className="text-balance text-4xl font-semibold lg:text-5xl text-foreground mb-4"
            preset="fade-in-blur"
            trigger={hasTriggered}
            speedReveal={2}
          >
            {learnMoreData.howItWorks.title.split(" ").map((word, index) =>
              word === "Kick" ? (
                <span key={index} className="text-primary font-bold">
                  {" "}
                  {word}
                </span>
              ) : word === "Back" ? (
                <span key={index} className="text-primary font-bold">
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
            className="text-lg text-muted-foreground"
            preset="fade-in-blur"
            delay={0.2}
            trigger={hasTriggered}
            speedReveal={2}
          >
            {learnMoreData.howItWorks.subtitle}
          </TextEffect>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={itemVariants}
        >
          {learnMoreData.howItWorks.steps.map((step, index) => (
            <Card
              key={index}
              className="text-center p-6 hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="mb-3">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
