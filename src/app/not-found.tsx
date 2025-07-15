import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { MagicBackButtonWrapper } from "./_components/MagicBackButtonWrapper";

export const metadata: Metadata = {
  title: "Page Not Found | Kick Back",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardContent className="pt-8 pb-8 px-6">
          {/* 404 Number */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-primary/20 select-none">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="space-y-3 mb-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. The page
              might have been moved, deleted, or the URL might be incorrect.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="flex gap-2">
              <MagicBackButtonWrapper />

              <Button asChild variant="outline" className="flex-1">
                <Link href="/events">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Events
                </Link>
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Visit our{" "}
              <Link
                href="/dashboard"
                className="text-primary hover:underline font-medium"
              >
                dashboard
              </Link>{" "}
              or{" "}
              <Link
                href="/groups"
                className="text-primary hover:underline font-medium"
              >
                explore groups
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
