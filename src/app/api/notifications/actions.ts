"use server";

import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteNotificationAction(notificationId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    // Verify the notification belongs to the user before deleting
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== session.user.id) {
      throw new Error("Not authorized to delete this notification");
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete notification error:", error);
    throw error;
  }
}
