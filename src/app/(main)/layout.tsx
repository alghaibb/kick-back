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


  // Map to CalendarEvent type
  

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
