import { AdminDashboardClient } from "./_components/AdminDashboardClient";
import RevokeUserSessionsModal from "./_components/RevokeUserSessionsModal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Administrative dashboard for managing users, events, groups, and system monitoring.",
  openGraph: {
    title: "Admin Dashboard",
    description:
      "Administrative dashboard for managing users, events, groups, and system monitoring.",
  },
  twitter: {
    title: "Admin Dashboard",
    description:
      "Administrative dashboard for managing users, events, groups, and system monitoring.",
  },
};

export default function AdminPage() {
  return (
    <>
      <AdminDashboardClient />
      <RevokeUserSessionsModal />
    </>
  );
}
