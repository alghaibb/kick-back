import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint, p256dh, auth } = await request.json();

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: "Missing subscription data" },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existingSubscription) {
      // Update if it belongs to a different user (device switched users)
      if (existingSubscription.userId !== session.user.id) {
        await prisma.pushSubscription.update({
          where: { endpoint },
          data: {
            userId: session.user.id,
            p256dh,
            auth,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    // Create new subscription
    await prisma.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint,
        p256dh,
        auth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    // Remove subscription
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
