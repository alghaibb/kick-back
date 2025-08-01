"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { learnMoreData } from "@/lib/constants";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Benefits() {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { unlocked, unlockNext } = useSectionAnimation();
  const myIndex = 2;
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (isInView && unlocked >= myIndex && !hasTriggered) {
      controls.start("visible");
      setHasTriggered(true);
      setTimeout(unlockNext, 300);
    }
  }, [isInView, unlocked, controls, unlockNext, hasTriggered]);

  return (
    <section className="py-16 md:py-32 bg-muted/30" ref={ref}>
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
            {learnMoreData.benefits.title.split(" ").map((word, index) =>
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
            {learnMoreData.benefits.subtitle}
          </TextEffect>
        </div>

        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          variants={itemVariants}
        >
          {learnMoreData.benefits.features.map((feature, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="mb-2">{feature.title}</CardTitle>
                  <p className="text-muted-foreground mb-3">
                    {feature.description}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {feature.highlights.map((highlight, idx) => {
                      const HighlightIcon =
                        feature.highlightIcons?.[idx] || (() => null);
                      return (
                        <li key={idx} className="flex items-center gap-2">
                          <HighlightIcon className="w-3 h-3 text-primary" />
                          {highlight}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
