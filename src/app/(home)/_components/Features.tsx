"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { coreFeatures } from "@/lib/constants";
import { LazyMotion, domAnimation, easeOut, m } from "framer-motion";

export default function Features() {
  return (
    <LazyMotion features={domAnimation}>
      <section className="relative w-full pt-24 pb-32 px-4">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto text-center space-y-6 md:space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Everything you need to stay in sync and never miss a moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            {coreFeatures.map(({ icon: Icon, title, description }, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                  ease: easeOut,
                }}
              >
                <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
                  <CardHeader className="items-center">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-primary/10 bg-primary/10 mb-2">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{description}</CardDescription>
                  </CardContent>
                </Card>
              </m.div>
            ))}
          </div>
        </m.div>
      </section>
    </LazyMotion>
  );
}
