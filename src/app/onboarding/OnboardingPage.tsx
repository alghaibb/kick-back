import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
} from "@/components/ui/auth-card";

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
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthCard className="w-full max-w-md">
        <AuthCardHeader>
          <AuthCardTitle>Finish Setting Up</AuthCardTitle>
          <AuthCardDescription>
            You can set a nickname and update your profile image before getting
            started.
          </AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          <OnboardingForm user={user} />
        </AuthCardContent>
      </AuthCard>
    </div>
  );
}
