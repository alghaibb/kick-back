"use client";

import {
  LazyMotion,
  domAnimation,
  easeInOut,
  easeOut,
  m,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Calendar, Clock, Smartphone, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HeroDesktop() {
  const titles = useMemo(
    () => ["organized", "connected", "prepared", "reminded", "stress-free"],
    []
  );
  const [titleNumber, setTitleNumber] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2500);
    return () => clearTimeout(timeout);
  }, [titleNumber, titles]);

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
        <div className="absolute inset-0 hidden md:block">
          <m.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
            whileInView={{ y: [-10, 10, -10], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: easeInOut }}
          />
          <m.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
            whileInView={{ y: [-15, 15, -15], opacity: [0.2, 0.4, 0.2] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: easeInOut,
              delay: 2,
            }}
          />
        </div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center gap-8 md:gap-12 px-4 py-16 md:py-24"
        >
          <div className="space-y-4 md:space-y-6">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary backdrop-blur-sm px-4 md:px-6 py-2 text-sm font-medium"
            >
              <Bell className="w-4 h-4 mr-2" />
              Never miss another event
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Stay
              </span>

              <div className="relative h-[56px] md:h-[88px] lg:h-[96px] overflow-hidden flex justify-center items-center">
                {titles.map((title, index) => (
                  <m.span
                    key={index}
                    className="absolute left-1/2 -translate-x-1/2 font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent leading-tight"
                    initial={{ opacity: 0, y: 50 }}
                    animate={
                      titleNumber === index
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: -50 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 20,
                    }}
                  >
                    {title}
                  </m.span>
                ))}
              </div>

              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-muted-foreground font-normal">
                with Kick Back
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get intelligent reminders for every important moment in your life.
              Smart scheduling, perfect timing, never miss what matters most.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Smart Scheduling</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Perfect Timing</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <span>Email & SMS</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center w-full max-w-md">
            <div className="flex-1">
              <Button asChild size="lg" className="w-full">
                <Link href="/create-account">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-border hover:bg-muted"
              >
                <Link href="/learn-more">See How It Works</Link>
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground/70">
            Join thousands of organized people worldwide • No credit card
            required
          </div>
        </m.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    </LazyMotion>
  );
}
