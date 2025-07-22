"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { motion, useInView, Variants } from "framer-motion";
import { Bell, CalendarClock, Users } from "lucide-react";
import { ReactNode, useRef } from "react";

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const cardsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.8,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
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

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50% 0px" });
  const { activeTheme } = useThemeConfig();

  return (
    <section className="bg-transparent py-16 md:py-32" ref={ref}>
      <div className="@container mx-auto max-w-5xl px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headingVariants}
          className="text-center"
        >
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl text-foreground">
            Effortless event management
          </h2>
          <p className="mt-4 text-muted-foreground text-base">
            Automated reminders, groups, and a dashboard built for modern
            organizers.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardsContainerVariants}
        >
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
            <motion.div
              className={`group theme-${activeTheme}`}
              variants={cardVariants}
            >
              <CardHeader className="pb-3">
                <CardDecorator theme={activeTheme}>
                  <Bell className="size-6" aria-hidden />
                </CardDecorator>
                <h3 className="mt-6 font-medium text-primary text-lg">
                  Automated Reminders
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-base">
                  SMS, email, or both: reminders sent automatically at the time
                  you set during onboarding.
                </p>
              </CardContent>
            </motion.div>

            <motion.div
              className={`group theme-${activeTheme}`}
              variants={cardVariants}
            >
              <CardHeader className="pb-3">
                <CardDecorator theme={activeTheme}>
                  <Users className="size-6" aria-hidden />
                </CardDecorator>
                <h3 className="mt-6 font-medium text-primary text-lg">
                  Groups & Events
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-base">
                  Create groups, invite friends, manage all your events—keep
                  everything organized in one place.
                </p>
              </CardContent>
            </motion.div>

            <motion.div
              className={`group theme-${activeTheme}`}
              variants={cardVariants}
            >
              <CardHeader className="pb-3">
                <CardDecorator theme={activeTheme}>
                  <CalendarClock className="size-6" aria-hidden />
                </CardDecorator>
                <h3 className="mt-6 font-medium text-primary text-lg">
                  Smart Scheduling
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-base">
                  Find the perfect time for everyone, sync with your calendar,
                  and avoid double bookings.
                </p>
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>
      </div>
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
