import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";
import { markAllNotificationsAsRead } from "@/lib/notifications";

export async function PATCH() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await markAllNotificationsAsRead(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
