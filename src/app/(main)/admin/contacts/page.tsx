import { Metadata } from "next";
import { AdminContactsClient } from "../_components/AdminContactsClient";
import { AdminAccessGuard } from "../_components/AdminAccessGuard";

export const metadata: Metadata = {
  title: "Admin | Contact Messages",
  description: "View and manage contact form submissions",
  openGraph: {
    title: "Admin | Contact Messages",
    description: "View and manage contact form submissions",
  },
};

export default function AdminContactsPage() {
  return (
    <AdminAccessGuard>
      <AdminContactsClient />
    </AdminAccessGuard>
  );
}
