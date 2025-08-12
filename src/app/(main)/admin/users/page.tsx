import { AdminUsersClient } from "../_components/AdminUsersClient";
import { AdminAccessGuard } from "../_components/AdminAccessGuard";
import { DeleteUserModal } from "../_components/DeleteUserModal";
import RevokeUserSessionsModal from "../_components/RevokeUserSessionsModal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Users",
  description: "Manage users in the admin panel",
};

export default function AdminUsersPage() {
  return (
    <AdminAccessGuard>
      <AdminUsersClient />
      <DeleteUserModal />
      <RevokeUserSessionsModal />
    </AdminAccessGuard>
  );
}
