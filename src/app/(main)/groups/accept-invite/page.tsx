export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/sessions";
import { AcceptInviteForm } from "./AcceptInviteForm";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getSession();
  const token = (await searchParams).token;

  if (!token) redirect("/dashboard");
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="container max-w-md mx-auto py-8">
      <AcceptInviteForm token={token} />
    </div>
  );
}
