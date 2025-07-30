import { lazy, Suspense } from "react";
import { MainLayoutClient } from "./_components/MainLayoutClient";

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
const EditEventModal = lazy(
  () => import("./events/_components/EditEventModal")
);
const DeleteCommentModal = lazy(() =>
  import("./events/comments/_components/DeleteCommentModal").then((m) => ({
    default: m.DeleteCommentModal,
  }))
);
const ReplyCommentModal = lazy(() =>
  import("./events/comments/_components/ReplyCommentModal").then((m) => ({
    default: m.ReplyCommentModal,
  }))
);
const EditCommentModal = lazy(() =>
  import("./events/comments/_components/EditCommentModal").then((m) => ({
    default: m.EditCommentModal,
  }))
);
const CreateGroupModal = lazy(() =>
  import("./groups/_components/CreateGroupModal").then((m) => ({
    default: m.CreateGroupModal,
  }))
);
const EditGroupModal = lazy(() =>
  import("./groups/_components/EditGroupModal").then((m) => ({
    default: m.EditGroupModal,
  }))
);
const InviteGroupModal = lazy(() =>
  import("./groups/_components/InviteGroupModal").then((m) => ({
    default: m.InviteGroupModal,
  }))
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <Suspense fallback={null}>
        <EditEventModal />
      </Suspense>
      <Suspense fallback={null}>
        <DeleteCommentModal />
      </Suspense>
      <Suspense fallback={null}>
        <ReplyCommentModal />
      </Suspense>
      <Suspense fallback={null}>
        <EditCommentModal />
      </Suspense>
    </>
  );
}
