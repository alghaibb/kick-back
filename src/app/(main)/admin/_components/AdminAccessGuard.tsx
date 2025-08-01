"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";

interface AdminAccessGuardProps {
  children: React.ReactNode;
}

function AdminAccessGuardContent({ children }: AdminAccessGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/forbidden");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}

export function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      }
    >
      <AdminAccessGuardContent>{children}</AdminAccessGuardContent>
    </Suspense>
  );
}
