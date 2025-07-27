"use client";

import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { buttonPressVariants } from "@/lib/animationVariants";

interface AnimatedButtonProps extends ButtonProps {
  enableAnimation?: boolean;
}

export function AnimatedButton({
  enableAnimation = true,
  children,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      variants={enableAnimation ? buttonPressVariants : undefined}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}
