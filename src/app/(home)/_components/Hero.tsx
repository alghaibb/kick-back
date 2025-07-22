"use client";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import type { Transition, Variants } from "framer-motion";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      } as Transition,
    },
  },
};

const headlineWords = [
  { text: "Plan,", className: "" },
  { text: "Connect,", className: "text-primary" },
  { text: "Celebrate.", className: "" },
];

export default function Hero() {
  return (
    <main className="overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden contain-strict lg:block"
      >
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>
      <section>
        <div className="relative pt-24">
          <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
          <div className="mx-auto max-w-5xl px-6">
            <div className="sm:mx-auto lg:mr-auto lg:mt-0">
              <motion.h1
                className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 flex flex-wrap gap-x-3"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.13 } },
                }}
              >
                {headlineWords.map((word, idx) => (
                  <motion.span
                    key={word.text + idx}
                    className={word.className}
                    variants={{
                      hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
                      visible: {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        transition: {
                          type: "spring",
                          duration: 1,
                          bounce: 0.28,
                        },
                      },
                    }}
                  >
                    {word.text}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subheadline example (optional, can use block fade-in) */}
              <motion.p
                initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                transition={{ delay: 0.6, duration: 1.1, type: "spring" }}
                className="mt-8 max-w-2xl text-pretty text-lg"
              >
                Organize events and groups with ease.{" "}
                <span className="font-bold text-primary">Kick Back</span> is
                your modern dashboard for every occasion—simple, beautiful, and
                powerful.
              </motion.p>

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-12 flex gap-2 flex-col sm:flex-row sm:justify-start sm:gap-4"
              >
                <div key={1}>
                  <Button
                    asChild
                    size="lg"
                    className="text-base w-full sm:w-auto"
                  >
                    <Link href="/create-account">Get Started</Link>
                  </Button>
                </div>
                <div key={2} className="w-full sm:w-auto">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-base w-full sm:w-auto"
                  >
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </AnimatedGroup>
            </div>
          </div>
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              ...transitionVariants,
            }}
          >
            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
              <div
                aria-hidden
                className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
              />
              <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-5xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                <Image
                  className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                  src="/dashboard-dark.png"
                  alt="app screen"
                  width="2700"
                  height="1440"
                  placeholder="blur"
                  priority
                  blurDataURL="/dashboard-blur-dark.png"
                />
                <Image
                  className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                  src="/dashboard-light.png"
                  alt="app screen"
                  width="2700"
                  height="1440"
                  placeholder="blur"
                  priority
                  blurDataURL="/dashboard-blur-light.png"
                />
              </div>
            </div>
          </AnimatedGroup>
        </div>
      </section>
    </main>
  );
}
