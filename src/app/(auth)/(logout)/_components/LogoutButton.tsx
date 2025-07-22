"use client";

import { LoadingButton } from "@/components/ui/button";
import { useSession } from "@/providers/SessionProvider";
import { useRouter } from "next/navigation";
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
  const { fetchUser } = useSession();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await logout();
      await fetchUser();
      router.push("/login");
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
      {isPending ? "Logging Out..." : children || "Log Out"}
    </LoadingButton>
  );
}
