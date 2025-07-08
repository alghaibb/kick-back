import { redirect } from "next/navigation";
import { getSession } from "@/lib/sessions";
import { AcceptInviteForm } from "./AcceptInviteForm";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSession();
  const token = searchParams.token;

  if (!token || typeof token !== "string") {
    redirect("/dashboard");
  }

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <AcceptInviteForm token={token} />
    </div>
  );
}
