"use client";

import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { motion, useAnimation, useInView, Variants } from "framer-motion";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export default function CallToAction() {
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
        className="mx-auto max-w-5xl px-6 text-center"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <motion.h2
          className="text-balance text-4xl font-semibold lg:text-5xl"
          variants={itemVariants}
        >
          Ready to make event planning effortless?
        </motion.h2>

        <motion.p
          className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto"
          variants={itemVariants}
        >
          Join your family and friends in creating unforgettable moments. Start
          planning today with easy-to-use tools designed just for you.
        </motion.p>

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
