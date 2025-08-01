"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { allFeatures } from "@/lib/constants";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function FeaturesGrid() {
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
        className="mx-auto max-w-7xl px-6"
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
            Complete <span className="text-primary font-bold">Feature Set</span>
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
            Every tool you need for successful event planning and management
          </TextEffect>
        </div>

        <motion.div
          className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8"
          variants={itemVariants}
        >
          {allFeatures.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="mb-3 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-1">
                  {feature.highlights.map((highlight, idx) => {
                    const HighlightIcon =
                      feature.highlightIcons?.[idx] || (() => null);
                    return (
                      <li
                        key={idx}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                      >
                        <HighlightIcon className="w-3 h-3 text-primary" />
                        {highlight}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
