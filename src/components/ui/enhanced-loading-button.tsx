"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  ActionLoader,
  PulseLoader,
  SuccessAnimation,
  ErrorAnimation,
} from "./loading-animations";
import { Button } from "./button";

// Button variants (reusing from your existing button.tsx)
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        outlineSecondary:
          "border border-primary text-primary hover:text-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        expandIcon:
          "group relative text-primary-foreground hover:text-primary-foreground/90 bg-primary hover:bg-primary/90",
        ringHover:
          "bg-primary text-primary-foreground hover:text-primary-foreground/90 transition-all duration-300 hover:bg-primary/90 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2",
        shine:
          "text-primary-foreground hover:text-primary-foreground/90 animate-shine bg-gradient-to-r from-primary via-primary/75 to-primary bg-[length:400%_100%] dark:text-secondary-foreground",
        gooeyRight:
          "text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-gradient-to-r from-zinc-400 before:transition-transform before:duration-1000 hover:before:translate-x-[0%] hover:before:translate-y-[0%] dark:text-secondary-foreground",
        gooeyLeft:
          "text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l from-zinc-400 after:transition-transform after:duration-1000 hover:after:translate-x-[0%] hover:after:translate-y-[0%] dark:text-secondary-foreground",
        linkHover1:
          "relative after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300 text-primary hover:text-primary/80 dark:text-secondary-foreground",
        linkHover2:
          "relative after:absolute after:bg-primary after:bottom-2 after:h-[2px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300 text-primary hover:text-primary/80 dark:text-secondary-foreground",
        basic: "text-foreground hover:text-foreground/70 duration-200",
        modernHover:
          "bg-background text-primary hover:text-primary/80 border border-primary font-semibold shadow-none hover:translate-y-[-4px] hover:translate-x-[-2px] hover:shadow-[2px_5px_0_0_rgba(74,115,235,1)] active:translate-y-[2px] active:translate-x-[1px] active:shadow-[2px_5px_0_0_rgba(66,115,244,1)] transition-all duration-300 dark:text-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "mobile-icon": "h-11 w-11",
        "mobile-sm": "h-11 rounded-md px-4",
        "icon-responsive":
          "h-10 w-10 sm:h-10 sm:w-10 [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface EnhancedLoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  action?:
    | "upload"
    | "send"
    | "save"
    | "delete"
    | "invite"
    | "create"
    | "update"
    | "admin"
    | "sync"
    | "process";
  success?: boolean;
  error?: boolean;
  showSuccessAnimation?: boolean;
  showErrorAnimation?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  icon?: React.ReactNode;
  iconPlacement?: "left" | "right";
}

const EnhancedLoadingButton = React.forwardRef<
  HTMLButtonElement,
  EnhancedLoadingButtonProps
>(
  (
    {
      className,
      variant,
      size,
      loading,
      action,
      success,
      error,
      showSuccessAnimation = true,
      showErrorAnimation = true,
      loadingText,
      successText,
      errorText,
      icon,
      iconPlacement = "left",
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Determine button state and content
    const isSuccess = success && showSuccessAnimation;
    const isError = error && showErrorAnimation;
    const isDisabled = loading || isSuccess || isError || props.disabled;

    // Get appropriate text based on state
    const getButtonText = () => {
      if (isSuccess && successText) return successText;
      if (isError && errorText) return errorText;
      if (loading && loadingText) return loadingText;
      return children;
    };

    // Get appropriate icon based on state
    const getButtonIcon = () => {
      if (isSuccess) return <SuccessAnimation size="sm" />;
      if (isError) return <ErrorAnimation size="sm" />;
      if (loading && action) return <ActionLoader action={action} size="sm" />;
      if (loading) return <PulseLoader size="sm" />;
      if (icon) return icon;
      return null;
    };

    // Auto-adjust size for mobile on icon buttons
    const mobileAdjustedSize = size === "icon" ? "icon-responsive" : size;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size: mobileAdjustedSize, className }),
          isDisabled && "opacity-50 cursor-not-allowed",
          isSuccess && "bg-green-500 hover:bg-green-600",
          isError && "bg-red-500 hover:bg-red-600"
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {iconPlacement === "left" && getButtonIcon() && (
          <span className="mr-2">{getButtonIcon()}</span>
        )}
        {getButtonText()}
        {iconPlacement === "right" && getButtonIcon() && (
          <span className="ml-2">{getButtonIcon()}</span>
        )}
      </Comp>
    );
  }
);

EnhancedLoadingButton.displayName = "EnhancedLoadingButton";

// Re-export the base Button component
export { Button, buttonVariants };
export { EnhancedLoadingButton };
