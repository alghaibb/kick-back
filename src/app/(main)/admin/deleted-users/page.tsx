import { AdminDeletedUsersClient } from "../_components/AdminDeletedUsersClient";
import { AdminAccessGuard } from "../_components/AdminAccessGuard";
import { RecoverUserModal } from "../_components/RecoverUserModal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Deleted Users",
  description: "View and manage deleted users in the admin panel",
  openGraph: {
    title: "Admin | Deleted Users",
    description: "View and manage deleted users in the admin panel",
  },
};

export default function AdminDeletedUsersPage() {
  return (
    <AdminAccessGuard>
      <AdminDeletedUsersClient />
      <RecoverUserModal />
    </AdminAccessGuard>
  );
}
