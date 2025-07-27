import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";
import { markNotificationAsRead } from "@/lib/notifications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await markNotificationAsRead(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
