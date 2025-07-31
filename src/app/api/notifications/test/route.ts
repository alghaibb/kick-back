import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/notifications";

export async function POST() {
  // Only allow in development
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

    // Send a test push notification
    await sendPushNotification(session.user.id, {
      title: "Test Notification",
      body: "This is a test push notification from Kick Back! 🎉",
      data: {
        type: "TEST",
        timestamp: Date.now(),
      },
      actions: [
        { action: "view", title: "View App" },
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
