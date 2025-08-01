"use client";

import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { useSectionAnimation } from "@/providers/SectionAnimationProvider";
import { motion, useAnimation, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { unlocked, unlockNext } = useSectionAnimation();
  const myIndex = 0;
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (isInView && unlocked >= myIndex && !hasTriggered) {
      controls.start("visible");
      setHasTriggered(true);
      setTimeout(unlockNext, 300);
    }
  }, [isInView, unlocked, controls, unlockNext, hasTriggered]);

  return (
    <main className="overflow-hidden" ref={ref}>
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
          <motion.div
            className="mx-auto max-w-5xl px-6"
            initial="hidden"
            animate={controls}
            variants={containerVariants}
          >
            <div className="sm:mx-auto lg:mr-auto lg:mt-0">
              <TextEffect
                per="word"
                as="h1"
                className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16"
                preset="fade-in-blur"
                trigger={hasTriggered}
                speedReveal={2}
              >
                Plan, <span className="text-primary font-bold">Connect</span>,
                Celebrate.
              </TextEffect>

              <TextEffect
                per="word"
                as="p"
                className="mt-8 max-w-2xl text-pretty text-lg"
                preset="fade-in-blur"
                delay={0.3}
                trigger={hasTriggered}
                speedReveal={2}
              >
                Organize events and groups with ease.{" "}
                <span className="font-bold text-primary">Kick Back</span> is
                your modern dashboard for every occasion—simple, beautiful, and
                powerful.
              </TextEffect>

              <motion.div
                className="mt-12 flex gap-2 flex-col sm:flex-row sm:justify-start sm:gap-4"
                variants={itemVariants}
              >
                <Button
                  asChild
                  size="lg"
                  className="text-base w-full sm:w-auto"
                >
                  <Link href="/create-account">Get Started</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-base w-full sm:w-auto"
                >
                  <Link href="/learn-more">Learn More</Link>
                </Button>
              </motion.div>
            </div>

            <motion.div
              className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20"
              variants={itemVariants}
            >
              <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-5xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                <div className="relative">
                  <Image
                    className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                    src="/dashboard-dark.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                    placeholder="blur"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    blurDataURL="/dashboard-blur-light.png"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background from-40% via-70% to-100% pointer-events-none rounded-2xl"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
