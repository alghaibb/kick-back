import { Metadata } from "next";
import { AcceptEventInvitePage } from "./AcceptEventInvitePage";

export const metadata: Metadata = {
  title: "Accept Event Invitation",
  description: "Accept your event invitation on Kick Back",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <AcceptEventInvitePage token={token} />;
}
