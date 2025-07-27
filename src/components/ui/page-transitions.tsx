"use client";

import { motion, AnimatePresence } from "framer-motion";
import { pageTransitionVariants } from "@/lib/animationVariants";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageTransitionVariants}
      transition={{
        type: "tween",
        ease: "easeInOut",
        duration: 0.3,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition className={className}>{children}</PageTransition>
    </AnimatePresence>
  );
}
