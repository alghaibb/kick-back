import { Metadata } from "next";
import { AdminEventsClient } from "./_components/AdminEventsClient";

export const metadata: Metadata = {
  title: "Admin Events",
  description:
    "Admin panel for managing and monitoring all events on the platform.",
};

export default function Page() {
  return <AdminEventsClient />;
}
