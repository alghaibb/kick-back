import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        inAppNotifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasPassword = !!user.password;

    return NextResponse.json({
      user: {
        ...user,
        reminderType: user.reminderType as "email" | "sms" | "both",
        phoneNumber: user.phoneNumber,
        notificationOptIn: user.notificationOptIn,
        inAppNotifications: user.inAppNotifications,
      },
      hasPassword,
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
