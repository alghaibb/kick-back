"use client";

import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Content() {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { unlocked, unlockNext } = useSectionAnimation();
  const myIndex = 2;
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
        className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16"
        initial="hidden"
        animate={isInView && unlocked >= myIndex ? controls : "hidden"}
        variants={containerVariants}
      >
        <TextEffect
          per="word"
          as="h2"
          className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl"
          preset="fade-in-blur"
          trigger={hasTriggered}
          speedReveal={2}
        >
          Bringing your{" "}
          <span className="text-primary font-bold">family and friends</span>{" "}
          together effortlessly.
        </TextEffect>

        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
          <motion.div
            className={`relative mb-6 sm:mb-0 theme-${activeTheme}`}
            variants={itemVariants}
          >
            <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
              <Image
                src="/gatherings.png"
                alt="Gatherings illustration"
                width={1207}
                height={929}
                className="rounded-[15px]"
                placeholder="blur"
                blurDataURL="/gatherings-blur.png"
              />
            </div>
          </motion.div>

          <div className="relative space-y-4">
            <TextEffect
              per="word"
              as="p"
              className="text-muted-foreground"
              preset="fade-in-blur"
              delay={0.2}
              trigger={hasTriggered}
              speedReveal={2}
            >
              Plan{" "}
              <span className="font-bold text-primary">memorable events</span>{" "}
              with ease and joy.{" "}
              <span className="font-bold text-primary">
                Connect, organize, and celebrate
              </span>{" "}
              with those who matter most.
            </TextEffect>
            <TextEffect
              per="word"
              as="p"
              className="text-muted-foreground"
              preset="fade-in-blur"
              delay={0.4}
              trigger={hasTriggered}
              speedReveal={2}
            >
              From intimate gatherings to big celebrations, manage{" "}
              <span className="font-bold text-primary">
                invites, schedules, and reminders
              </span>{" "}
              — all in one place.
            </TextEffect>
            <TextEffect
              per="word"
              as="p"
              className="text-muted-foreground"
              preset="fade-in-blur"
              delay={0.6}
              trigger={hasTriggered}
              speedReveal={2}
            >
              <span className="font-bold text-primary">
                Automated reminders
              </span>{" "}
              help ensure everyone stays informed and on time.
            </TextEffect>
            <TextEffect
              per="word"
              as="p"
              className="text-muted-foreground"
              preset="fade-in-blur"
              delay={0.8}
              trigger={hasTriggered}
              speedReveal={2}
            >
              Simplify your event planning so you can focus on{" "}
              <span className="font-bold text-primary">making memories</span>.
            </TextEffect>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
