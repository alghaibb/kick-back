import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

interface MessageProps {
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  className?: string;
}

const messageStyles = {
  success: {
    container:
      "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
    icon: "text-green-600 dark:text-green-400",
    title: "text-green-800 dark:text-green-200",
    message: "text-green-700 dark:text-green-300",
  },
  error: {
    container:
      "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-800 dark:text-red-200",
    message: "text-red-700 dark:text-red-300",
  },
  info: {
    container:
      "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-800 dark:text-blue-200",
    message: "text-blue-700 dark:text-blue-300",
  },
  warning: {
    container:
      "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20",
    icon: "text-yellow-600 dark:text-yellow-400",
    title: "text-yellow-800 dark:text-yellow-200",
    message: "text-yellow-700 dark:text-yellow-300",
  },
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

function Message({ type, title, message, className }: MessageProps) {
  const styles = messageStyles[type];
  const Icon = icons[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border",
        "animate-in fade-in-0 slide-in-from-top-2 duration-300",
        styles.container,
        className
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", styles.icon)} />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn("text-sm font-semibold mb-1", styles.title)}>
            {title}
          </h4>
        )}
        <p className={cn("text-sm", styles.message)}>{message}</p>
      </div>
    </div>
  );
}

export { Message };
