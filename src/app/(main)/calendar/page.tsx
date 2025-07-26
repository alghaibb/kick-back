import { CalendarDays } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "../_components/PageHeader";
import { CalendarSkeleton } from "./_components/CalendarSkeleton";
import { CalendarPageClientWithComments } from "./_components/CalendarPageClientWithComments";

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

      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarPageClientWithComments />
      </Suspense>
    </div>
  );
}
