"use client";

import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { motion, useAnimation, useInView, Variants } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
      when: "beforeChildren",
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 0.8,
    },
  },
};

export default function Content() {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { activeTheme } = useThemeConfig();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return (
    <section className={`py-16 md:py-32 theme-${activeTheme}`} ref={ref}>
      <motion.div
        className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <motion.h2
          className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl"
          variants={itemVariants}
        >
          Bringing your family and friends together effortlessly.
        </motion.h2>

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

          <motion.div className="relative space-y-4" variants={itemVariants}>
            <p className="text-muted-foreground">
              Plan memorable events with ease and joy.{" "}
              <span className="text-accent-foreground font-bold">
                <span className="text-primary">Connect</span>,{" "}
                <span className="text-primary">organize</span>, and{" "}
                <span className="text-primary">celebrate</span>
              </span>{" "}
              with those who matter most.
            </p>
            <p className="text-muted-foreground">
              From intimate gatherings to big celebrations, manage invites,
              schedules, and reminders — all in one place.
            </p>
            <p className="text-muted-foreground">
              Automated reminders help ensure everyone stays informed and on
              time.
            </p>
            <p className="text-muted-foreground">
              Simplify your event planning so you can focus on making memories.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
