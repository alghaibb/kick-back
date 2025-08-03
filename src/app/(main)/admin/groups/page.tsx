import { Metadata } from "next";
import { AdminGroupsClient } from "./_components/AdminGroupsClient";

export const metadata: Metadata = {
  title: "Admin Groups | Kick Back",
  description:
    "Admin panel for managing and monitoring all groups on the platform.",
};

export default function Page() {
  return <AdminGroupsClient />;
} 