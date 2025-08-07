"use client";

import { useAuth } from "@/hooks/use-auth";

import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AdminAccessGuardProps {
  children: React.ReactNode;
}

function AdminAccessGuardContent({ children }: AdminAccessGuardProps) {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Spinner size="large" />
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Show forbidden page if user is not admin
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="relative pt-24 pb-16">
        <div className="mx-auto max-w-md px-6">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">
                Access Forbidden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You don&apos;t have permission to access this area. This section
                is restricted to administrators only.
              </p>

              <div className="flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>

                <Button asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <Spinner size="large" />
            <p className="text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
      }
    >
      <AdminAccessGuardContent>{children}</AdminAccessGuardContent>
    </Suspense>
  );
}
