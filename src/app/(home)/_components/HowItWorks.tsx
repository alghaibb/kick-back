"use client";

import { howItWorks } from "@/lib/constants";
import { LazyMotion, domAnimation, easeOut, m } from "framer-motion";

const features = howItWorks;

export default function HowItWorks() {
  return (
    <LazyMotion features={domAnimation}>
      <section className="relative w-full pt-24 pb-24 px-4">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="max-w-6xl mx-auto text-center space-y-6 md:space-y-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            How It Works
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Set your preferences once — and let{" "}
            <span className="font-semibold text-primary">Kick Back</span> handle
            the rest.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gap-y-16">
            {features.map(({ icon: Icon, title, description }, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  ease: easeOut,
                  delay: index * 0.15,
                }}
                className="flex flex-col items-center text-center p-6 border border-border bg-card hover:shadow-md rounded-xl min-h-[240px] transition-all"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-primary/10 bg-primary/10 mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold leading-snug text-foreground">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm mt-2">
                  {description}
                </p>
              </m.div>
            ))}
          </div>
        </m.div>
      </section>
    </LazyMotion>
  );
}
