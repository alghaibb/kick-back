export const dynamic = "force-dynamic";

import { PageHeader } from "../_components/PageHeader";
import { CreateActionButton } from "../_components/CreateActionButton";
import { Calendar } from "lucide-react";
import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { EventCard } from "./_components/EventCard";

export const metadata: Metadata = {
  title: "Events",
  description: "Where your upcoming and past events will be.",
};

export default async function Page() {
  const session = await getSession();
  if (!session?.user?.id) {
    return (
      <div className="container py-8">
        You must be logged in to view events.
      </div>
    );
  }

  const groupMemberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    select: { groupId: true },
  });

  const groupIds = groupMemberships.map((gm) => gm.groupId);

  const events = await prisma.event.findMany({
    where: {
      OR: [
        { createdBy: session.user.id },
        { attendees: { some: { userId: session.user.id } } },
        { groupId: { in: groupIds } },
      ],
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="container py-8">
      <PageHeader
        icon={<Calendar className="h-6 w-6" />}
        title="Events"
        subtitle="Manage and create events for your groups or personal use."
        action={
          <CreateActionButton modalType="create-event" label="Create Event" />
        }
      />
      {events.length === 0 ? (
        <div className="text-muted-foreground">No events yet.</div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              name={event.name}
              description={event.description || ""}
              date={event.date.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
