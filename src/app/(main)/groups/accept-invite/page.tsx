import { redirect } from "next/navigation";
import { getSession } from "@/lib/sessions";
import { AcceptInviteForm } from "./AcceptInviteForm";

interface AcceptInvitePageProps {
  searchParams: { token?: string };
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const session = await getSession();
  const { token } = searchParams;

  if (!token) {
    redirect("/dashboard");
  }

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <AcceptInviteForm token={token!} />
    </div>
  );
}
