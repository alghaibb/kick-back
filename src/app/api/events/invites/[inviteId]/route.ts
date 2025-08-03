import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;

    // Find the invite
    const invite = await prisma.eventInvite.findFirst({
      where: {
        token: inviteId,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            date: true,
            location: true,
          },
        },
        inviter: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      event: invite.event,
      inviter: invite.inviter,
    });
  } catch (error) {
    console.error("Fetch event invite error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
} 