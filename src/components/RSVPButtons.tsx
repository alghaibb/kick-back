"use client";

import { Button } from "@/components/ui/button";
import { useRSVPMutation, useRSVPStatus } from "@/hooks/mutations/useRSVP";
import type { RSVPStatus } from "@/types/rsvp";
import { Check, X, HelpCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionLoader } from "@/components/ui/loading-animations";

interface RSVPButtonsProps {
  eventId: string;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function RSVPButtons({
  eventId,
  disabled = false,
  size = "sm",
  className,
}: RSVPButtonsProps) {
  const { data: rsvpData, isLoading } = useRSVPStatus(eventId);
  const rsvpMutation = useRSVPMutation();

  const currentStatus = rsvpData?.rsvpStatus as RSVPStatus;

  const handleRSVP = (status: RSVPStatus) => {
    if (disabled || rsvpMutation.isPending) return;
    rsvpMutation.mutate({ eventId, status });
  };

  const buttons = [
    {
      status: "yes" as RSVPStatus,
      label: "Yes",
      icon: Check,
      variant: "outline" as const,
      activeClass:
        "bg-green-500 dark:bg-green-500 hover:bg-green-600 dark:hover:bg-green-600 text-background",
    },
    {
      status: "maybe" as RSVPStatus,
      label: "Maybe",
      icon: HelpCircle,
      variant: "outline" as const,
      activeClass:
        "bg-yellow-500 dark:bg-yellow-500 hover:bg-yellow-600 dark:hover:bg-yellow-600 text-text-background",
    },
    {
      status: "no" as RSVPStatus,
      label: "No",
      icon: X,
      variant: "outline" as const,
      activeClass:
        "bg-red-500 dark:bg-red-500 hover:bg-red-600 dark:hover:bg-red-600 text-backgrounde",
    },
  ];

  if (isLoading) {
    return (
      <div className={cn("flex gap-2", className)}>
        {buttons.map((button) => (
          <Button
            key={button.status}
            variant="outline"
            size={size}
            disabled
            className="min-w-[80px]"
          >
            <Clock className="w-4 h-4 mr-1" />
            {button.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {buttons.map((button) => {
        const Icon = button.icon;
        const isActive = currentStatus === button.status;
        const isPending = rsvpMutation.isPending;

        return (
          <Button
            key={button.status}
            variant={isActive ? "default" : button.variant}
            size={size}
            onClick={() => handleRSVP(button.status)}
            disabled={disabled || isPending}
            className={cn(
              "min-w-[80px] transition-all duration-200",
              isActive && button.activeClass,
              isPending &&
                rsvpMutation.variables?.status === button.status &&
                "opacity-60"
            )}
          >
            {/* Show custom loader for the button being clicked, otherwise show the regular icon */}
            {isPending && rsvpMutation.variables?.status === button.status ? (
              <ActionLoader action="update" size="sm" className="mr-1" />
            ) : (
              <Icon className="w-4 h-4 mr-1" />
            )}
            {button.label}
          </Button>
        );
      })}
    </div>
  );
}

// Simple status display component
export function RSVPStatus({
  eventId,
  className,
}: {
  eventId: string;
  className?: string;
}) {
  const { data: rsvpData, isLoading } = useRSVPStatus(eventId);

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center text-sm text-muted-foreground",
          className
        )}
      >
        <Clock className="w-4 h-4 mr-1" />
        Loading...
      </div>
    );
  }

  if (!rsvpData) return null;

  const statusConfig = {
    yes: { label: "Attending", icon: Check, color: "text-green-600" },
    no: { label: "Not attending", icon: X, color: "text-red-600" },
    maybe: {
      label: "Maybe attending",
      icon: HelpCircle,
      color: "text-yellow-600",
    },
    pending: { label: "Pending response", icon: Clock, color: "text-gray-600" },
  };

  const config = statusConfig[rsvpData.rsvpStatus as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center text-sm", config.color, className)}>
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </div>
  );
}
