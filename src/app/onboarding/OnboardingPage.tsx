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
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      nickname: true,
      image: true,
      hasOnboarded: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.hasOnboarded) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
       <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      <AuthCard className="w-full max-w-md">
        <AuthCardHeader className="text-center">
          <AuthCardTitle className="text-2xl font-bold">
            Welcome to Kick Back! 
          </AuthCardTitle>
          <AuthCardDescription className="text-base">
            Let's get your profile set up so you can start planning amazing
            events with your friends and family.
          </AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          <OnboardingForm user={user} />
        </AuthCardContent>
      </AuthCard>
    </div>
  );
}
