import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { ProfileForm } from "../ProfileForm";

export async function ProfileContent() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get fresh user data from database instead of session
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      nickname: true,
      image: true,
      password: true, // Check if user has a password
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Check if user has a password (for showing password change section)
  const hasPassword = !!user.password;

  return <ProfileForm user={user} hasPassword={hasPassword} />;
}
