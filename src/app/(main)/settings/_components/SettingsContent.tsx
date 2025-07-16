import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { SettingsForm } from "../SettingsForm";

export async function SettingsContent() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get fresh user data from database instead of session
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      password: true,
      timezone: true,
      reminderTime: true,
      reminderType: true,
      phoneNumber: true,
      notificationOptIn: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const hasPassword = !!user.password;

  return (
    <SettingsForm
      user={{
        ...user,
        reminderType: user.reminderType as "email" | "sms" | "both",
        phoneNumber: user.phoneNumber,
        notificationOptIn: user.notificationOptIn,
      }}
      hasPassword={hasPassword}
    />
  );
}
