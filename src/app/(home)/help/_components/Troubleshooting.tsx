import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Troubleshooting() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Troubleshooting</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Common Issues</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Not receiving notifications?
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Check your notification settings in your device settings and
                  in the app. Make sure you&apos;ve granted permission for
                  notifications.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Can&apos;t upload photos?
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Ensure your photo is under the size limit for the upload type:
                  Event photos (10MB), Comment photos (5MB), Group images (4MB),
                  or Profile pictures (2MB). Check your internet connection.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Group invite not working?
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Group invites are sent by email. Check your email spam folder
                  or ask the group admin to resend the invitation.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  App not loading?
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Try refreshing the page or clearing your browser cache. If
                  using the PWA, try reinstalling it from your home screen.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Still Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If you&apos;re still experiencing issues, we&apos;re here to help.
              Contact us through your account settings or reach out directly.
            </p>

            <div className="flex gap-3">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
