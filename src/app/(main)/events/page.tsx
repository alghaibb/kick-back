import { Calendar } from "lucide-react";
import { Suspense } from "react";
import { CreateActionButton } from "../_components/CreateActionButton";
import { PageHeader } from "../_components/PageHeader";
import { EventsClient } from "./_components/EventsClient";
import { EventsSkeleton } from "./_components/EventsSkeleton";

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<Calendar className="h-6 w-6 text-primary" />}
        title="Events"
        subtitle="Manage and view all your events in one place. Create, edit, and track your upcoming gatherings."
        action={
          <CreateActionButton modalType="create-event" label="Create Event" />
        }
      />

      <Suspense fallback={<EventsSkeleton />}>
        <EventsClient />
      </Suspense>
    </div>
  );
}
