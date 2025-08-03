import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { inviteId } = await params;

    // Find and validate invite
    const invite = await prisma.eventInvite.findFirst({
      where: {
        token: inviteId,
        status: "pending",
        expiresAt: { gt: new Date() }
      },
      include: {
        event: { select: { id: true, name: true } },
        inviter: { select: { firstName: true, email: true } },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    if (invite.email !== session.user.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Mark invite as declined and delete notification
    await prisma.$transaction(async (tx) => {
      await tx.eventInvite.update({
        where: { id: invite.id },
        data: { status: "declined" },
      });

      // Delete the notification for this invitation
      await tx.notification.deleteMany({
        where: {
          userId: session.user.id,
          type: "EVENT_INVITE",
          data: {
            path: ["inviteId"],
            equals: inviteId,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `You declined the invitation to "${invite.event.name}"`,
    });
  } catch (error) {
    console.error("Decline event invite error:", error);
    return NextResponse.json(
      { error: "Failed to decline invitation" },
      { status: 500 }
    );
  }
} 