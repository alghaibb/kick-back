"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cardHoverVariants } from "@/lib/animationVariants";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  enableHover?: boolean;
  children: React.ReactNode;
}

export function AnimatedCard({
  enableHover = true,
  className,
  children,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={enableHover ? cardHoverVariants : undefined}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn("cursor-pointer", className)}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  );
}
