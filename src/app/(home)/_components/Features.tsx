"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { features } from "@/lib/constants";
import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

export default function Features() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { unlocked, unlockNext } = useSectionAnimation();
  const myIndex = 1;
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
    <section className="bg-transparent py-16 md:py-32" ref={ref}>
      <motion.div
        className="@container mx-auto max-w-5xl px-6"
        initial="hidden"
        animate={isInView && unlocked >= myIndex ? controls : "hidden"}
        variants={containerVariants}
      >
        <div className="text-center">
          <TextEffect
            per="word"
            as="h2"
            className="text-balance text-4xl font-semibold lg:text-5xl text-foreground"
            preset="fade-in-blur"
            trigger={hasTriggered}
            speedReveal={2}
          >
            <span className="text-primary font-bold">Effortless</span> event
            management
          </TextEffect>
          <TextEffect
            per="word"
            as="p"
            className="mt-4 text-muted-foreground text-base"
            preset="fade-in-blur"
            delay={0.2}
            trigger={hasTriggered}
            speedReveal={2}
          >
            <span className="font-bold text-primary">Automated reminders</span>,
            groups, and a dashboard built for{" "}
            <span className="font-bold text-primary">modern organizers</span>.
          </TextEffect>
        </div>

        <motion.div variants={itemVariants}>
          <Card
            className="
              @min-4xl:max-w-full
              @min-4xl:grid-cols-3
              @min-4xl:divide-x
              @min-4xl:divide-y-0
              mx-auto mt-8
              grid max-w-sm divide-y
              overflow-hidden
              bg-background/80
              shadow-xl
              backdrop-blur-[2px]
              *:text-center
              md:mt-16
            "
          >
            {features.map((feature) => (
              <div key={feature.title} className={`group theme-${activeTheme}`}>
                <CardHeader className="pb-3">
                  <CardDecorator theme={activeTheme}>
                    <feature.icon className="size-6" aria-hidden />
                  </CardDecorator>
                  <h3 className="mt-6 font-medium text-primary text-lg">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-base">{feature.description}</p>
                </CardContent>
              </div>
            ))}
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
}

const CardDecorator = ({
  children,
  theme,
}: {
  children: ReactNode;
  theme: string;
}) => (
  <div
    className={`relative mx-auto size-36 duration-300 transition-all theme-${theme}`}
  >
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
    />
    <div
      aria-hidden
      className="bg-radial to-background absolute inset-0 from-transparent to-75%"
    />
    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
      {children}
    </div>
  </div>
);
