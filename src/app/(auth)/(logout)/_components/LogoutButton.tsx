"use client";

import { LoadingButton } from "@/components/ui/button";
import { useTransition } from "react";
import { logout } from "../actions";

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
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      logout();
    });
  }

  return (
    <LoadingButton
      onClick={handleClick}
      loading={isPending}
      disabled={isPending}
      className={className}
      variant={variant}
    >
      {isPending ? "Logging out..." : children || "Log out"}
    </LoadingButton>
  );
}
