import { cn } from "@/lib/utils";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 group/button cursor-pointer transform-gpu",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground border",
        outlineSecondary: "border border-primary text-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        expandIcon:
          "group relative text-primary-foreground bg-primary hover:bg-primary/90",
        ringHover:
          "bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2",
        shine:
          "text-primary-foreground animate-shine bg-gradient-to-r from-primary via-primary/75 to-primary bg-[length:400%_100%] dark:text-secondary-foreground ",
        gooeyRight:
          "text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-gradient-to-r from-zinc-400 before:transition-transform before:duration-1000  hover:before:translate-x-[0%] hover:before:translate-y-[0%] dark:text-secondary-foreground ",
        gooeyLeft:
          "text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l from-zinc-400 after:transition-transform after:duration-1000  hover:after:translate-x-[0%] hover:after:translate-y-[0%] dark:text-secondary-foreground ",
        linkHover1:
          "relative after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300 text-primary dark:text-secondary-foreground",
        linkHover2:
          "relative after:absolute after:bg-primary after:bottom-2 after:h-[2px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300 text-primary dark:text-secondary-foreground",
        basic: "hover:text-foreground/50 duration-200",
        modernHover:
          "bg-background text-primary border border-primary font-semibold shadow-none hover:translate-y-[-4px] hover:translate-x-[-2px] hover:shadow-[2px_5px_0_0_rgba(74,115,235,1)] active:translate-y-[2px] active:translate-x-[1px] active:shadow-[2px_5px_0_0_rgba(66,115,244,1)] transition-all duration-300 dark:text-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "mobile-icon": "h-11 w-11",
        "mobile-sm": "h-11 rounded-md px-4",
        "icon-responsive":
          "h-10 w-10 sm:h-10 sm:w-10 [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11", // Larger on touch devices
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface IconProps {
  Icon: React.ElementType;
  iconPlacement: "left" | "right";
}

interface IconRefProps {
  Icon?: never;
  iconPlacement?: undefined;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export type ButtonIconProps = IconProps | IconRefProps;

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      Icon,
      iconPlacement,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {Icon && iconPlacement === "left" && (
          <div className="group-hover:translate-x-100 w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:pr-2 group-hover:opacity-100">
            <Icon />
          </div>
        )}
        <Slottable>{props.children}</Slottable>
        {Icon && iconPlacement === "right" && (
          <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
            <Icon />
          </div>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

// LoadingButton component with mobile-friendly sizing
const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    loading?: boolean;
    icon?: React.ReactNode;
  }
>(({ className, variant, size, loading, children, icon, ...props }, ref) => {
  // Auto-adjust size for mobile on icon buttons
  const mobileAdjustedSize = size === "icon" ? "icon-responsive" : size;

  return (
    <Button
      className={cn(className, loading && "opacity-50 cursor-not-allowed")}
      disabled={loading || props.disabled}
      ref={ref}
      variant={variant}
      size={mobileAdjustedSize}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current"></div>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
});
LoadingButton.displayName = "LoadingButton";

export { Button, LoadingButton, buttonVariants };
