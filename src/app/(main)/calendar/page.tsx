import { CalendarDays } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "../_components/PageHeader";
import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { CalendarPageClientWithComments } from "./_components/CalendarPageClientWithComments";
import { PageErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "Your Calendar",
  description:
    "Where you can view your calendar, upon clicking on the dates, it'll show you the list of events you have that day.",
};

export default function Page() {
  return (
    <div className="container py-8">
      <PageHeader
        icon={<CalendarDays className="h-6 w-6" />}
        title="Your Calendar"
        subtitle="View all your upcoming events here"
        action=""
      />

      <PageErrorBoundary title="Calendar Page">
        <Suspense fallback={<UnifiedSkeleton variant="simple" />}>
          <CalendarPageClientWithComments />
        </Suspense>
      </PageErrorBoundary>
    </div>
  );
}
