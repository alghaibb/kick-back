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

  return (
    <>
      <MainLayoutClient>{children}</MainLayoutClient>
      <CreateGroupModal />
      <InviteGroupModal />
      <CreateEventModal />
      <DeleteEventModal />
      <EditGroupModal />
      <EditEventModal />
    </>
  );
}
