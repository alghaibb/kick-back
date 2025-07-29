import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { inviteId } = params;

    // Find and validate invite
    const invite = await prisma.groupInvite.findUnique({
      where: { token: inviteId },
      include: {
        group: { select: { id: true, name: true } },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "This invitation has already been used or cancelled" },
        { status: 400 }
      );
    }

    if (invite.email !== session.user.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Mark invite as declined
    await prisma.groupInvite.update({
      where: { id: invite.id },
      data: { status: "declined" },
    });

    return NextResponse.json({
      success: true,
      message: `Declined invitation to "${invite.group.name}"`,
    });
  } catch (error) {
    console.error("Decline invite error:", error);
    return NextResponse.json(
      { error: "Failed to decline invitation" },
      { status: 500 }
    );
  }
}
