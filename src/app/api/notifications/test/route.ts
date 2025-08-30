import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/notifications";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 }
    );
  }

  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await sendPushNotification(session.user.id, {
      title: "Test Event Comment",
      body: "Someone commented on your event! Tap to view.",
      data: {
        type: "EVENT_COMMENT",
        eventId: "test-event-123",
        commentId: "test-comment-456",
        timestamp: Date.now(),
      },
      actions: [
        { action: "view", title: "View Event" },
        { action: "dismiss", title: "Dismiss" },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully",
    });
  } catch (error) {
    console.error("Failed to send test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
