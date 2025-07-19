import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { ProfileForm } from "../ProfileForm";

export async function ProfileContent() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      nickname: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileForm user={user} />;
}
