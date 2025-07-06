import * as React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

function AuthCard({ className, children, ...props }: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl",
        "ring-1 ring-border/20",
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        className
      )}
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-transparent to-muted/20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-8">{children}</div>
    </div>
  );
}

function AuthCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mb-8 text-center space-y-3", className)} {...props} />
  );
}

function AuthCardTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

function AuthCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-base text-muted-foreground leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

function AuthCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-6", className)} {...props} />;
}

function AuthCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-8 pt-6 border-t border-border/50 space-y-4", className)}
      {...props}
    />
  );
}

export {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
};
