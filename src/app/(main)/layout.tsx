import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { lazy, Suspense } from "react";
import { MainLayoutClient } from "./_components/MainLayoutClient";
import EditEventModal from "./events/_components/EditEventModal";

// Lazy load modals - reduces initial bundle size
const CreateEventModal = lazy(() =>
  import("./events/_components/CreateEventModal").then((m) => ({
    default: m.CreateEventModal,
  }))
);
const DeleteEventModal = lazy(() =>
  import("./events/_components/DeleteEventModal").then((m) => ({
    default: m.DeleteEventModal,
  }))
);
const CreateGroupModal = lazy(() =>
  import("./groups/_components/CreateGroupModal").then((m) => ({
    default: m.CreateGroupModal,
  }))
);
const EditGroupModal = lazy(
  () => import("./groups/_components/EditGroupModal")
);
const InviteGroupModal = lazy(() =>
  import("./groups/_components/InviteGroupModal").then((m) => ({
    default: m.InviteGroupModal,
  }))
);

export const dynamic = "force-dynamic";

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
      {/* Lazy-loaded modals with suspense boundaries */}
      <Suspense fallback={null}>
        <CreateGroupModal />
      </Suspense>
      <Suspense fallback={null}>
        <InviteGroupModal />
      </Suspense>
      <Suspense fallback={null}>
        <CreateEventModal />
      </Suspense>
      <Suspense fallback={null}>
        <DeleteEventModal />
      </Suspense>
      <Suspense fallback={null}>
        <EditGroupModal />
      </Suspense>
      <EditEventModal />
    </>
  );
}
