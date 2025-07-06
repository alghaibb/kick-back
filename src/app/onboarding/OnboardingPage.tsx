import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.hasOnboarded) {
    redirect("/dashboard");
  }

  return (
    <div className="md:p-8">
      <h2 className="text-2xl md:text-center font-bold text-primary">
        Finish Setting Up
      </h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-center">
        You can set a nickname and update your profile image before getting
        started.
      </p>
      <OnboardingForm user={user} />
    </div>
  );
}
