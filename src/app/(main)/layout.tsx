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
const DeleteGroupModal = lazy(() =>
  import("./groups/_components/DeleteGroupModal").then((m) => ({
    default: m.DeleteGroupModal,
  }))
);
const InviteGroupModal = lazy(() =>
  import("./groups/_components/InviteGroupModal").then((m) => ({
    default: m.InviteGroupModal,
  }))
);
const InviteEventModal = lazy(() =>
  import("./events/_components/InviteToEventModal").then((m) => ({
    default: m.InviteToEventModal,
  }))
);
const LeaveEventModal = lazy(() =>
  import("./events/_components/LeaveEventModal").then((m) => ({
    default: m.LeaveEventModal,
  }))
);
const CreateTemplateModal = lazy(() =>
  import("./events/templates/_components/CreateTemplateModal").then((m) => ({
    default: m.CreateTemplateModal,
  }))
);
const EditTemplateModal = lazy(() =>
  import("./events/templates/_components/EditTemplateModal").then((m) => ({
    default: m.EditTemplateModal,
  }))
);
const DeleteTemplateModal = lazy(() =>
  import("./events/templates/_components/DeleteTemplateModal").then((m) => ({
    default: m.DeleteTemplateModal,
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
        <DeleteGroupModal />
      </Suspense>
      <Suspense fallback={null}>
        <EditEventModal />
      </Suspense>

      <Suspense fallback={null}>
        <ReplyCommentModal />
      </Suspense>
      <Suspense fallback={null}>
        <EditCommentModal />
      </Suspense>
      <Suspense fallback={null}>
        <InviteEventModal />
      </Suspense>
      <Suspense fallback={null}>
        <LeaveEventModal />
      </Suspense>
      <Suspense fallback={null}>
        <CreateTemplateModal />
      </Suspense>
      <Suspense fallback={null}>
        <EditTemplateModal />
      </Suspense>
      <Suspense fallback={null}>
        <DeleteTemplateModal />
      </Suspense>
    </>
  );
}
