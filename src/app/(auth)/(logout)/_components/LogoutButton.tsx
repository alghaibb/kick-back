"use client";

import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import { useAuth } from "@/hooks/use-auth";

type ButtonVariants =
  | "default"
  | "destructive"
  | "outline"
  | "outlineSecondary"
  | "secondary"
  | "ghost"
  | "link"
  | "expandIcon"
  | "ringHover"
  | "shine"
  | "gooeyRight"
  | "gooeyLeft"
  | "linkHover1"
  | "modernHover";

interface LogoutProps {
  className?: string;
  variant?: ButtonVariants;
  children?: React.ReactNode;
}

export default function LogoutButton({
  className,
  variant,
  children,
}: LogoutProps) {
  const { logout, isLoggingOut } = useAuth();

  return (
    <EnhancedLoadingButton
      onClick={logout}
      loading={isLoggingOut}
      disabled={isLoggingOut}
      className={className}
      variant={variant}
      action="admin"
      loadingText="Logging Out..."
    >
      {children || "Log Out"}
    </EnhancedLoadingButton>
  );
}
