"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { technicalFeatures } from "@/lib/constants";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function TechnicalFeatures() {
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
            Built with{" "}
            <span className="text-primary font-bold">Modern Technology</span>
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
            Performance, security, and reliability you can count on
          </TextEffect>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={itemVariants}
        >
          {technicalFeatures.map((feature, index) => (
            <Card key={index} className="text-center p-8">
              <CardHeader className="pb-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="mb-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-3 h-3 text-primary">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
