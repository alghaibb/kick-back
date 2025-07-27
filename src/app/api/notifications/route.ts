import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(session.user.id, page, limit),
      getUnreadNotificationCount(session.user.id),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
