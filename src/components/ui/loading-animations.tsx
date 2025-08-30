"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Check,
  Upload,
  Send,
  Save,
  Trash2,
  UserPlus,
  Calendar,
  Settings,
  Shield,
  Database,
  RefreshCw,
} from "lucide-react";

// Pulse animation for general loading
export function PulseLoader({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("bg-current rounded-full", sizeClasses[size])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Bouncing dots for playful loading
export function BounceLoader({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("bg-current rounded-full", sizeClasses[size])}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Spinning loader with custom icon
export function IconLoader({
  icon: Icon,
  size = "md",
  className,
  variant = "spin",
}: {
  icon: React.ComponentType<{ className?: string }>;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "spin" | "pulse" | "bounce";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const variants = {
    spin: { rotate: 360 },
    pulse: { scale: [1, 1.1, 1] },
    bounce: { y: [0, -4, 0] },
  };

  const transitions = {
    spin: { duration: 1, repeat: Infinity, ease: "linear" as const },
    pulse: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
    bounce: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const },
  };

  return (
    <motion.div
      className={cn("text-current", sizeClasses[size], className)}
      animate={variants[variant]}
      transition={transitions[variant]}
    >
      <Icon className="w-full h-full" />
    </motion.div>
  );
}

export function ActionLoader({
  action,
  size = "md",
  className,
}: {
  action:
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
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const actionConfig = {
    upload: {
      icon: Upload,
      variant: "bounce" as const,
      color: "text-blue-500",
    },
    send: { icon: Send, variant: "pulse" as const, color: "text-green-500" },
    save: { icon: Save, variant: "pulse" as const, color: "text-blue-500" },
    delete: { icon: Trash2, variant: "pulse" as const, color: "text-red-500" },
    invite: {
      icon: UserPlus,
      variant: "bounce" as const,
      color: "text-purple-500",
    },
    create: {
      icon: Calendar,
      variant: "bounce" as const,
      color: "text-emerald-500",
    },
    update: {
      icon: RefreshCw,
      variant: "spin" as const,
      color: "text-amber-500",
    },
    admin: {
      icon: Shield,
      variant: "pulse" as const,
      color: "text-indigo-500",
    },
    sync: { icon: Database, variant: "spin" as const, color: "text-cyan-500" },
    process: {
      icon: Settings,
      variant: "spin" as const,
      color: "text-slate-500",
    },
  };

  const config = actionConfig[action];

  return (
    <IconLoader
      icon={config.icon}
      size={size}
      className={cn(config.color, className)}
      variant={config.variant}
    />
  );
}

// Progress loader with percentage
export function ProgressLoader({
  progress,
  size = "md",
  showPercentage = true,
  className,
}: {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-2 w-16",
    md: "h-3 w-24",
    lg: "h-4 w-32",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "bg-muted rounded-full overflow-hidden",
          sizeClasses[size]
        )}
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-muted-foreground min-w-[2rem]">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}

// Skeleton loader for content
export function SkeletonLoader({
  type = "text",
  className,
}: {
  type?: "text" | "avatar" | "card" | "button";
  className?: string;
}) {
  const baseClasses = "animate-pulse bg-muted rounded";

  const typeClasses = {
    text: "h-4 w-full",
    avatar: "h-10 w-10 rounded-full",
    card: "h-32 w-full",
    button: "h-10 w-24",
  };

  return <div className={cn(baseClasses, typeClasses[type], className)} />;
}

// Wave loader for modern feel
export function WaveLoader({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-3 w-16",
    md: "h-4 w-20",
    lg: "h-5 w-24",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-1",
        sizeClasses[size],
        className
      )}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="bg-current rounded-full"
          style={{ width: "2px" }}
          animate={{
            height: ["40%", "100%", "40%"],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Success animation for completed actions
export function SuccessAnimation({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <motion.div
      className={cn("text-green-500", sizeClasses[size], className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.5,
      }}
    >
      <Check className="w-full h-full" />
    </motion.div>
  );
}

export function ErrorAnimation({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <motion.div
      className={cn("text-red-500", sizeClasses[size], className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.2, 1],
        opacity: 1,
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
    >
      <div className="w-full h-full rounded-full border-2 border-current flex items-center justify-center">
        <span className="text-xs font-bold">!</span>
      </div>
    </motion.div>
  );
}

export const LoadingStates = {
  form: {
    submit: <ActionLoader action="save" size="sm" />,
    create: <ActionLoader action="create" size="sm" />,
    update: <ActionLoader action="update" size="sm" />,
    delete: <ActionLoader action="delete" size="sm" />,
  },

  data: {
    sync: <ActionLoader action="sync" size="sm" />,
    process: <ActionLoader action="process" size="sm" />,
    load: <PulseLoader size="sm" />,
  },

  user: {
    invite: <ActionLoader action="invite" size="sm" />,
    admin: <ActionLoader action="admin" size="sm" />,
    auth: <WaveLoader size="sm" />,
  },

  file: {
    upload: <ActionLoader action="upload" size="sm" />,
    download: <BounceLoader size="sm" />,
  },

  communication: {
    send: <ActionLoader action="send" size="sm" />,
    message: <WaveLoader size="sm" />,
  },
};

// Smart loader that chooses the best animation based on context
export function SmartLoader({
  context,
  action,
  size = "md",
  className,
}: {
  context: keyof typeof LoadingStates;
  action?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const contextStates = LoadingStates[context];

  if (action && action in contextStates) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        {contextStates[action as keyof typeof contextStates]}
      </div>
    );
  }

  return <PulseLoader size={size} className={className} />;
}
