import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { MainLayoutClient } from "./_components/MainLayoutClient";
import { InviteGroupModal } from "./groups/_components/InviteGroupModal";
import { CreateEventModal } from "./events/_components/CreateEventModal";
import prisma from "@/lib/prisma";
import { CreateGroupModal } from "./groups/_components/CreateGroupModal";
import { DeleteEventModal } from "./events/_components/DeleteEventModal";
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { createdBy: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const eventsRaw = await prisma.event.findMany({
    where: {
      OR: [
        { createdBy: session.user.id },
        { attendees: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      group: { select: { name: true } },
      attendees: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // Map to CalendarEvent type
  const events = eventsRaw.map((event) => ({
    id: event.id,
    name: event.name,
    description: event.description ?? undefined,
    date: event.date,
    group: event.group ? { name: event.group.name } : undefined,
    attendees: event.attendees.map((a) => ({
      user: {
        id: a.user.id,
        nickname: a.user.nickname ?? undefined,
        firstName: a.user.firstName ?? undefined,
      },
    })),
  }));

  return (
    <>
      <MainLayoutClient user={session.user}>{children}</MainLayoutClient>
      <CreateGroupModal />
      <InviteGroupModal />
      <CreateEventModal groups={groups} />
      <DeleteEventModal />
    </>
  );
}
