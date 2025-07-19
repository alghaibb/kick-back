import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { MainLayoutClient } from "./_components/MainLayoutClient";
import { CreateEventModal } from "./events/_components/CreateEventModal";
import { DeleteEventModal } from "./events/_components/DeleteEventModal";
import EditEventModal from "./events/_components/EditEventModal";
import { CreateGroupModal } from "./groups/_components/CreateGroupModal";
import EditGroupModal from "./groups/_components/EditGroupModal";
import { InviteGroupModal } from "./groups/_components/InviteGroupModal";

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

  return (
    <>
      <MainLayoutClient>{children}</MainLayoutClient>
      <CreateGroupModal />
      <InviteGroupModal />
      <CreateEventModal groups={groups} />
      <DeleteEventModal />
      <EditGroupModal />
      <EditEventModal />
    </>
  );
}
