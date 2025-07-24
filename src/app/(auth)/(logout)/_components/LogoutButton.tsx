"use client";

import { LoadingButton } from "@/components/ui/button";
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
    <LoadingButton
      onClick={logout}
      loading={isLoggingOut}
      disabled={isLoggingOut}
      className={className}
      variant={variant}
    >
      {isLoggingOut ? "Logging Out..." : children || "Log Out"}
    </LoadingButton>
  );
}
